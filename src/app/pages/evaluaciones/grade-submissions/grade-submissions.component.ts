import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AssessmentService } from '../../../services/assessment.service';
import { Assessment, Submission } from '../../../models/assessment.model';

@Component({
  selector: 'app-grade-submissions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './grade-submissions.component.html',
})
export class GradeSubmissionsComponent implements OnInit {
  assessment: Assessment | null = null;
  submissions: Submission[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private assessmentService: AssessmentService
  ) {}

  ngOnInit(): void {
    const assessmentId = this.route.snapshot.params['id'];
    this.loadAssessment(assessmentId);
    this.loadSubmissions(assessmentId);
  }

  loadAssessment(id: string): void {
    this.assessmentService.getAssessmentById(id).subscribe({
      next: (assessment) => {
        this.assessment = assessment;
      },
      error: (error) => console.error('Error:', error)
    });
  }

  loadSubmissions(assessmentId: string): void {
    this.loading = true;

    this.assessmentService.getSubmissions(assessmentId).subscribe({
      next: (submissions) => {
        // Agregar campos temporales para calificación
        this.submissions = submissions.map(s => ({
          ...s,
          tempScore: s.score ?? 0,
          tempFeedback: s.feedback ?? ''
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.loading = false;
      }
    });
  }

  gradeSubmission(submission: any): void {
    if (!submission.tempScore) {
      alert('Por favor ingresa una calificación');
      return;
    }

    const gradeData = {
      score: submission.tempScore,
      feedback: submission.tempFeedback || 'Sin comentarios'
    };

    this.assessmentService.gradeSubmission(submission.id, gradeData).subscribe({
      next: () => {
        submission.status = 'graded';
        submission.score = submission.tempScore;
        submission.feedback = submission.tempFeedback;
        submission.graded_at = new Date();
        alert('Calificación guardada exitosamente');
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error al calificar');
      }
    });
  }

  getQuestions(submission: Submission): any[] {
    // Convertir las respuestas en array de preguntas
    const answers = submission.answers;
    return Object.keys(answers).map(questionId => ({
      text: `Pregunta ${questionId}`,
      answer: answers[questionId]
    }));
  }

  getGradedCount(): number {
    return this.submissions.filter(s => s.status === 'graded').length;
  }

  getPendingCount(): number {
    return this.submissions.filter(s => s.status === 'pending').length;
  }

  getAverageScore(): string {
    const gradedSubmissions = this.submissions.filter(s => s.score !== null);
    if (gradedSubmissions.length === 0) return '-';

    const sum = gradedSubmissions.reduce((acc, s) => acc + (s.score || 0), 0);
    return (sum / gradedSubmissions.length).toFixed(1);
  }

  calculatePercentage(score: number, maxScore: number): number {
    return Math.round((score / maxScore) * 100);
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.length >= 2
      ? (names[0][0] + names[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }
}