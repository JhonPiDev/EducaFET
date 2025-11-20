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
  
  timeRemaining = 0; // en segundos
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

  // Construir el objeto completo que exige el modelo Assessment
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

    // Campos obligatorios que tu backend aún no envía:
    due_date: found.assessment.due_date || null,
    status: found.assessment.status || "active",
    created_at: found.assessment.created_at || new Date().toISOString()
  };

  // Aquí ya NO da error porque el arreglo nunca será undefined
  this.questions = this.assessment.questions || [];

  // Crear respuestas vacías
  this.questions.forEach(q => {
    this.answers[q.id] = '';
  });

  // Timer (evitando error por assessment null)
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
        // Tiempo agotado, enviar automáticamente
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
    // Verificar que haya respondido al menos una pregunta
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

    this.questions.forEach((q, i) => {
      const userAnswer = (this.answers[i] || '').trim();
      const correctAnswer = (q.correct_answer || '').trim();

      // MULTIPLE CHOICE
      if (q.question_type === 'multiple_choice') {
        if (userAnswer === correctAnswer) {
          score += q.points;
          correct++;
        }
      }

      // TRUE / FALSE
      if (q.question_type === 'true_false') {
        if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
          score += q.points;
          correct++;
        }
      }

      // SHORT ANSWER
      if (q.question_type === 'short_answer') {
        if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
          score += q.points;
          correct++;
        }
      }

      // ESSAY (siempre suma)
      if (q.question_type === 'essay') {
        score += q.points;
      }
    });

    this.submissionResult = {
      message: "Evaluación enviada exitosamente",
      score: score,
      correct: correct,
      total: totalQuestions,
      maxScore: this.assessment?.max_score,
      percentage: Math.round((score / (this.assessment?.max_score || 1)) * 100)
    };
    // --- GUARDAR ESTADO DE COMPLETADA EN SESSIONSTORAGE ---
const raw = sessionStorage.getItem('assessments');
if (raw) {
  let list = JSON.parse(raw);

  list = list.map((item: any) => {
    if (item.assessment?.id == this.assessment?.id) {
      return {
        ...item,
        completed: true,       // <-- NUEVO
        score: score,          // <-- Puedes guardar puntaje también si quieres
        percentage: Math.round((score / (this.assessment?.max_score || 1)) * 100)
      };
    }
    return item;
  });

  sessionStorage.setItem('assessments', JSON.stringify(list));
}


    this.submitting = false;
    this.showResultModal = true;

  }, 1000);
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