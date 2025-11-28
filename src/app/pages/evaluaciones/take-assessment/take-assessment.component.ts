import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  
  // 🔑 CAMBIO CRÍTICO: Usar índice numérico como clave
  answers: { [index: number]: string } = {};

  loading = true;
  submitting = false;
  showConfirmModal = false;
  showResultModal = false;

  timeRemaining = 0;
  startTime = 0;
  timerSubscription?: Subscription;

  submissionResult: any = null;

  /** 🔹 Consola (log visual de respuestas) */
  consoleAnswers: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const assessmentId = this.route.snapshot.params['id'];
    this.loadAssessment(assessmentId);
    this.startTime = Date.now();
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }

  /** =====================================================
   *  CARGAR EVALUACIÓN DESDE SESSIONSTORAGE
   *  ===================================================== */
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

    this.assessment = found.assessment;
    this.questions = this.assessment?.questions || [];

    // Inicializar respuestas vacías usando ÍNDICES
    this.questions.forEach((q, index) => {
      this.answers[index] = '';
    });

    // Temporizador
    if (this.assessment?.time_limit) {
      this.timeRemaining = this.assessment.time_limit * 60;
      this.startTimer();
    }

    this.loading = false;
  }

  /** =====================================================
   *  TEMPORIZADOR
   *  ===================================================== */
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

  /** =====================================================
   *  CONSOLA DE RESPUESTAS
   *  ===================================================== */
  logAnswer(questionId: string, type: string, answer: any, correct: boolean | null = null) {
    this.consoleAnswers[questionId] = {
      type,
      answer,
      correct
    };
  }

  getConsoleKeys() {
    return Object.keys(this.consoleAnswers);
  }

  get isConsoleEmpty(): boolean {
    return Object.keys(this.consoleAnswers).length === 0;
  }

  /** =====================================================
   *  MÉTODO PRINCIPAL - USA ÍNDICE
   *  ===================================================== */
  setAnswer(questionIndex: number, value: string): void {
    console.log('🎯 setAnswer llamado:', {
      questionIndex,
      value,
      antes: this.answers[questionIndex]
    });

    // Guardar usando el índice
    this.answers[questionIndex] = value;

    console.log('✅ Después de actualizar:', {
      despues: this.answers[questionIndex],
      todasRespuestas: {...this.answers}
    });

    // Log para la consola visual
    const question = this.questions[questionIndex];
    if (question) {
      const correct = question.correct_answer && value === question.correct_answer;
      this.logAnswer(question.id || questionIndex.toString(), question.question_type, value, !!correct);
    }
  }

  /** =====================================================
   *  ENVÍO DE EVALUACIÓN
   *  ===================================================== */
  submitAssessment(): void {
    if (this.getAnsweredCount() === 0) {
      alert('Debes responder al menos una pregunta');
      return;
    }
    this.showConfirmModal = true;
  }

  getAnsweredCount(): number {
    return Object.values(this.answers).filter(a => a && a.trim() !== '').length;
  }

  confirmSubmit(): void {
    this.showConfirmModal = false;
    this.submitting = true;
    this.timerSubscription?.unsubscribe();

    setTimeout(() => {
      const totalQuestions = this.questions.length;
      let score = 0;
      let correct = 0;
      const detailedAnswers: any[] = [];

      // Iterar usando ÍNDICES
      this.questions.forEach((q, index) => {
        const userAnswer = (this.answers[index] || '').trim();
        const correctAnswer = (q.correct_answer || '').trim();
        let isCorrect = false;

        if (q.question_type === 'multiple_choice') {
          isCorrect = userAnswer === correctAnswer;
        }

        if (q.question_type === 'true_false') {
          isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
        }

        if (q.question_type === 'short_answer') {
          isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
        }

        if (q.question_type === 'essay') {
          isCorrect = true; // ensayo siempre 100%
        }

        if (isCorrect) {
          correct++;
          score += q.points;
        }

        detailedAnswers.push({
          questionId: q.id || `q_${index}`,
          questionIndex: index,
          questionText: q.question_text,
          questionType: q.question_type,
          userAnswer,
          correctAnswer,
          isCorrect,
          points: isCorrect ? q.points : 0,
          maxPoints: q.points
        });
      });

      const endTime = Date.now();
      const timeTaken = endTime - this.startTime;
      const timeMinutes = Math.floor(timeTaken / 60000);
      const timeSeconds = Math.floor((timeTaken % 60000) / 1000);

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
        } catch {}
      }

      const submissionData = {
        assessmentId: this.assessment?.id,
        assessmentTitle: this.assessment?.title,
        studentId: studentInfo.id,
        studentName: studentInfo.name,
        studentEmail: studentInfo.email,
        score,
        maxScore: this.assessment?.max_score || 0,
        percentage: this.calculatePercentage(correct, totalQuestions),
        correct,
        total: totalQuestions,
        submittedAt: new Date().toISOString(),
        timeTaken: `${timeMinutes}m ${timeSeconds}s`,
        answers: detailedAnswers
      };

      // 🟦 LOG COMPLETO DEL ENVÍO
      console.log("🟦 ENVÍO DE EVALUACIÓN -> submissionData:", {
        ...submissionData,
        answers: submissionData.answers.map(a => ({
          questionIndex: a.questionIndex,
          questionId: a.questionId,
          type: a.questionType,
          userAnswer: a.userAnswer,
          correctAnswer: a.correctAnswer,
          isCorrect: a.isCorrect,
          points: a.points
        }))
      });

      this.saveSubmissionToStorage(submissionData);
      this.markAssessmentAsCompleted(score, submissionData.percentage);

      this.submissionResult = {
        message: 'Evaluación enviada exitosamente',
        score,
        correct,
        total: totalQuestions,
        maxScore: this.assessment?.max_score,
        percentage: submissionData.percentage
      };

      this.submitting = false;
      this.showResultModal = true;

    }, 800);
  }

  /** =====================================================
   * GUARDAR RESULTADOS EN SESSIONSTORAGE
   * ===================================================== */
  private saveSubmissionToStorage(submissionData: any): void {
    try {
      const existingRaw = sessionStorage.getItem('assessment_submissions');
      const submissions = existingRaw ? JSON.parse(existingRaw) : [];
      submissions.push(submissionData);
      sessionStorage.setItem('assessment_submissions', JSON.stringify(submissions));
    } catch (err) {
      console.error('❌ Error guardando resultado:', err);
    }
  }

  /** =====================================================
   * MARCAR EVALUACIÓN COMO COMPLETADA
   * ===================================================== */
  private markAssessmentAsCompleted(score: number, percentage: number): void {
    try {
      const raw = sessionStorage.getItem('assessments');
      if (!raw) return;

      let list = JSON.parse(raw);

      list = list.map((item: any) => {
        if (item.assessment?.id == this.assessment?.id) {
          return {
            ...item,
            completed: true,
            score,
            percentage,
            completedAt: new Date().toISOString()
          };
        }
        return item;
      });

      sessionStorage.setItem('assessments', JSON.stringify(list));
    } catch {}
  }

  /** =====================================================
   * ACCIONES
   * ===================================================== */
  cancelAssessment(): void {
    if (confirm('¿Cancelar evaluación? Perderás todas tus respuestas.')) {
      this.router.navigate(['/evaluaciones']);
    }
  }

  goToList(): void {
    this.router.navigate(['/evaluaciones']);
  }

  getQuestionTypeLabel(type: string): string {
    switch (type) {
      case 'multiple_choice':
        return 'Selección Múltiple';
      case 'true_false':
        return 'Verdadero / Falso';
      case 'short_answer':
        return 'Respuesta Corta';
      case 'essay':
        return 'Ensayo';
      default:
        return 'Desconocido';
    }
  }

  /** =====================================================
   * CALCULAR PORCENTAJE BASADO EN PREGUNTAS ACERTADAS
   * ===================================================== */
  calculatePercentage(correct: number, totalQuestions: number): number {
    if (totalQuestions <= 0) return 0;
    return Math.round((correct / totalQuestions) * 100);
  }
}