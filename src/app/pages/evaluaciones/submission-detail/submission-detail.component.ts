import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-submission-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './submission-detail.component.html',
  styleUrl: './submission-detail.component.scss'
})
export class SubmissionDetailComponent implements OnInit {
  submission: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSubmissionDetail();
  }

  loadSubmissionDetail(): void {
    try {
      const submissionStr = sessionStorage.getItem('selected_submission');
      
      if (submissionStr) {
        this.submission = JSON.parse(submissionStr);
      } else {
        // Si no hay submission seleccionada, buscar por parámetros de ruta
        const assessmentId = this.route.snapshot.params['assessmentId'];
        const studentId = this.route.snapshot.params['studentId'];
        
        if (assessmentId && studentId) {
          this.findSubmission(assessmentId, studentId);
        } else {
          alert('No se encontró la información de la evaluación');
          this.router.navigate(['/dashboard/docente/resultados']);
        }
      }
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      alert('Error al cargar los detalles');
      this.router.navigate(['/dashboard/docente/resultados']);
    } finally {
      this.loading = false;
    }
  }

  findSubmission(assessmentId: string, studentId: string): void {
    const submissionsStr = sessionStorage.getItem('assessment_submissions');
    if (submissionsStr) {
      const submissions = JSON.parse(submissionsStr);
      this.submission = submissions.find(
        (s: any) => s.assessmentId === assessmentId && s.studentId === studentId
      );
    }
  }

  getStatusClass(percentage: number): string {
    if (percentage >= 90) return 'status-excellent';
    if (percentage >= 70) return 'status-good';
    if (percentage >= 60) return 'status-pass';
    return 'status-fail';
  }

  getStatusLabel(percentage: number): string {
    if (percentage >= 90) return 'Excelente';
    if (percentage >= 70) return 'Bueno';
    if (percentage >= 60) return 'Aprobado';
    return 'Reprobado';
  }

  getQuestionIcon(type: string): string {
    const icons: any = {
      'multiple_choice': '📝',
      'true_false': '✓✗',
      'short_answer': '✍️',
      'essay': '📄'
    };
    return icons[type] || '❓';
  }

  getQuestionTypeLabel(type: string): string {
    const labels: any = {
      'multiple_choice': 'Opción Múltiple',
      'true_false': 'Verdadero/Falso',
      'short_answer': 'Respuesta Corta',
      'essay': 'Ensayo'
    };
    return labels[type] || type;
  }

  goBack(): void {
    this.router.navigate(['/dashboard/docente/resultados']);
  }

  printResult(): void {
    window.print();
  }
}