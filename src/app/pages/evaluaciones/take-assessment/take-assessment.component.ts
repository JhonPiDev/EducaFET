import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AssessmentService } from '../../../services/assessment.service';
import { Assessment, Question } from '../../../models/assessment.model';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-take-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './take-assessment.component.html',
  styleUrl: './take-assessment.component.scss'
})
export class TakeAssessmentComponent implements OnInit, OnDestroy {
  assessment: Assessment | null = null;
  questions: Question[] = [];
  answers: { [questionId: string]: string } = {};
  
  loading = true;
  submitting = false;
  showConfirmModal = false;
  showResultModal = false;
  
  timeRemaining = 0;
  startTime = 0;
  timerSubscription?: Subscription;
  submissionResult: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assessmentService: AssessmentService
  ) {}

  ngOnInit(): void {
    const assessmentId = this.route.snapshot.params['id'];
    this.loadAssessment(assessmentId);
    this.startTime = Date.now();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  loadAssessment(id: string): void {
    this.loading = true;

    const raw = sessionStorage.getItem('assessments');
    if (!raw) {
      alert("No hay evaluaciones en sessionStorage");
      this.router.navigate(['/evaluaciones']);
      return;
    }

    const stored = JSON.parse(raw);
    const found = stored.find((e: any) => e.assessment?.id == id);

    if (!found) {
      alert("Evaluación no encontrada");
      this.router.navigate(['/evaluaciones']);
      return;
    }

    this.assessment = {
      id: found.assessment.id,
      title: found.assessment.title,
      description: found.assessment.description || "Sin descripción",
      type: found.assessment.type,
      course_id: found.assessment.course_id || null,
      course_name: found.assessment.course_name || "",
      max_score: found.assessment.max_score || 10,
      time_limit: found.assessment.time_limit || 10,
      attempts_allowed: found.assessment.attempts_allowed || 1,
      questions: found.assessment.questions || [],
      due_date: found.assessment.due_date || null,
      status: found.assessment.status || "active",
      created_at: found.assessment.created_at || new Date().toISOString()
    };

    this.questions = this.assessment.questions || [];

    this.questions.forEach(q => {
      this.answers[q.id] = '';
    });

    if (this.assessment.time_limit) {
      this.timeRemaining = this.assessment.time_limit * 60;
      this.startTimer();
    }

    this.loading = false;
  }

  startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.timeRemaining--;
      
      if (this.timeRemaining <= 0) {
        alert('¡Tiempo agotado! La evaluación se enviará automáticamente.');
        this.confirmSubmit();
      }
    });
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getAnsweredCount(): number {
    return Object.values(this.answers).filter(a => a && a.trim() !== '').length;
  }

  getQuestionTypeLabel(type: string): string {
    return this.assessmentService.getQuestionTypeLabel(type);
  }

  submitAssessment(): void {
    if (this.getAnsweredCount() === 0) {
      alert('Debes responder al menos una pregunta');
      return;
    }
    this.showConfirmModal = true;
  }

  confirmSubmit(): void {
    this.showConfirmModal = false;
    this.submitting = true;

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    setTimeout(() => {
      const totalQuestions = this.questions.length;
      let score = 0;
      let correct = 0;

      // Preparar array de respuestas detalladas
      const detailedAnswers: any[] = [];

      this.questions.forEach((q, i) => {
        const userAnswer = (this.answers[q.id] || '').trim();
        const correctAnswer = (q.correct_answer || '').trim();
        let isCorrect = false;

// MULTIPLE CHOICE
if (q.question_type === 'multiple_choice') {
  isCorrect = userAnswer === correctAnswer;
}

// TRUE / FALSE
if (q.question_type === 'true_false') {
  isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
}

// SHORT ANSWER
if (q.question_type === 'short_answer') {
  isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
}


        // ESSAY (siempre suma)
        if (q.question_type === 'essay') {
          isCorrect = true;
          score += q.points;
        }

        // Guardar respuesta detallada
        detailedAnswers.push({
          questionId: q.id,
          questionText: q.question_text,
          questionType: q.question_type,
          userAnswer: userAnswer,
          correctAnswer: correctAnswer,
          isCorrect: isCorrect,
          points: isCorrect ? q.points : 0,
          maxPoints: q.points
        });
      });

      // Calcular tiempo transcurrido
      const endTime = Date.now();
      const timeTakenMs = endTime - this.startTime;
      const timeTakenMinutes = Math.floor(timeTakenMs / 60000);
      const timeTakenSeconds = Math.floor((timeTakenMs % 60000) / 1000);
      const timeTakenFormatted = `${timeTakenMinutes}m ${timeTakenSeconds}s`;

      // Obtener información del estudiante
      const userStr = sessionStorage.getItem('current_user') || sessionStorage.getItem('user');
      let studentInfo = {
        id: 'unknown',
        name: 'Estudiante',
        email: 'sin-email@ejemplo.com'
      };

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          studentInfo = {
            id: user.id || 'unknown',
            name: user.name || 'Estudiante',
            email: user.email || 'sin-email@ejemplo.com'
          };
        } catch (e) {
          console.error('Error al parsear usuario:', e);
        }
      }

      // Crear objeto de resultado
      const submissionData = {
        assessmentId: this.assessment?.id,
        assessmentTitle: this.assessment?.title,
        studentId: studentInfo.id,
        studentName: studentInfo.name,
        studentEmail: studentInfo.email,
        score: score,
        maxScore: this.assessment?.max_score || 0,
        percentage: Math.round((score / (this.assessment?.max_score || 1)) * 100),
        correct: correct,
        total: totalQuestions,
        submittedAt: new Date().toISOString(),
        timeTaken: timeTakenFormatted,
        answers: detailedAnswers
      };

      // Guardar en sessionStorage para resultados del profesor
      this.saveSubmissionToStorage(submissionData);

      // Marcar evaluación como completada
      this.markAssessmentAsCompleted(score, submissionData.percentage);

      // Preparar resultado para mostrar al estudiante
      this.submissionResult = {
        message: "Evaluación enviada exitosamente",
        score: score,
        correct: correct,
        total: totalQuestions,
        maxScore: this.assessment?.max_score,
        percentage: submissionData.percentage
      };

      this.submitting = false;
      this.showResultModal = true;

    }, 1000);
  }

  /**
   * Guardar resultado en sessionStorage para que el profesor lo vea
   */
  private saveSubmissionToStorage(submissionData: any): void {
    try {
      const existingRaw = sessionStorage.getItem('assessment_submissions');
      let submissions = [];

      if (existingRaw) {
        submissions = JSON.parse(existingRaw);
      }

      // Agregar nueva submission
      submissions.push(submissionData);

      // Guardar en sessionStorage
      sessionStorage.setItem('assessment_submissions', JSON.stringify(submissions));
      
      console.log('✅ Resultado guardado correctamente:', submissionData);
    } catch (error) {
      console.error('❌ Error al guardar resultado:', error);
      alert('Advertencia: No se pudo guardar el resultado para el profesor.');
    }
  }

  /**
   * Marcar evaluación como completada
   */
  private markAssessmentAsCompleted(score: number, percentage: number): void {
    try {
      const raw = sessionStorage.getItem('assessments');
      if (raw) {
        let list = JSON.parse(raw);

        list = list.map((item: any) => {
          if (item.assessment?.id == this.assessment?.id) {
            return {
              ...item,
              completed: true,
              score: score,
              percentage: percentage,
              completedAt: new Date().toISOString()
            };
          }
          return item;
        });

        sessionStorage.setItem('assessments', JSON.stringify(list));
        console.log('✅ Evaluación marcada como completada');
      }
    } catch (error) {
      console.error('Error al marcar evaluación como completada:', error);
    }
  }

  cancelAssessment(): void {
    if (confirm('¿Estás seguro de que deseas cancelar? Perderás todas tus respuestas.')) {
      this.router.navigate(['/evaluaciones']);
    }
  }

  goToList(): void {
    this.router.navigate(['/evaluaciones']);
  }

  calculatePercentage(score: number, maxScore: number): number {
    return this.assessmentService.calculatePercentage(score, maxScore);
  }
}