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

    this.assessmentService.getAssessmentById(id).subscribe({
      next: (assessment) => {
        this.assessment = assessment;
        this.questions = assessment.questions || [];
        
        // Inicializar respuestas vacías
        this.questions.forEach(q => {
          this.answers[q.id] = '';
        });

        // Iniciar timer si tiene límite de tiempo
        if (assessment.time_limit) {
          this.timeRemaining = assessment.time_limit * 60; // convertir a segundos
          this.startTimer();
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar evaluación:', error);
        alert('Error al cargar la evaluación');
        this.router.navigate(['/evaluaciones']);
      }
    });
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

    // Detener timer
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    const submissionData = { answers: this.answers };

    this.assessmentService.submitAssessment(this.assessment!.id, submissionData).subscribe({
      next: (result) => {
        this.submissionResult = result;
        this.submitting = false;
        this.showResultModal = true;
      },
      error: (error) => {
        console.error('Error al enviar evaluación:', error);
        alert(error.error?.message || 'Error al enviar la evaluación');
        this.submitting = false;
      }
    });
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