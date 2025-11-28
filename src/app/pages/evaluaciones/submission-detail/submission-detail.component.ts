import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-submission-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './submission-detail.component.html',
  styleUrls: ['./submission-detail.component.scss']
})
export class SubmissionDetailComponent implements OnInit {

  submission: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const assessmentId = this.route.snapshot.params['assessmentId'];
    const studentId = this.route.snapshot.params['studentId'];
    
    this.loadSubmissionDetail(assessmentId, studentId);
  }

  loadSubmissionDetail(assessmentId: string, studentId: string): void {
    this.loading = true;

    try {
      // Obtener todas las submisiones de sessionStorage
      const submissionsRaw = sessionStorage.getItem('assessment_submissions');
      
      if (!submissionsRaw) {
        alert('No se encontraron resultados');
        this.router.navigate(['/assessment-results']);
        return;
      }

      const submissions = JSON.parse(submissionsRaw);
      
      // Buscar la submisión específica
      const found = submissions.find((s: any) => 
        s.assessmentId == assessmentId && s.studentId == studentId
      );

      if (!found) {
        alert('No se encontró el detalle de esta evaluación');
        this.router.navigate(['/assessment-results']);
        return;
      }

      this.submission = found;
      console.log('📄 Detalle de submisión cargado:', this.submission);
      
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      alert('Error al cargar los detalles');
      this.router.navigate(['/assessment-results']);
    } finally {
      this.loading = false;
    }
  }

  getStatusClass(percentage: number): string {
    if (percentage >= 70) return 'success';
    if (percentage >= 50) return 'warning';
    return 'danger';
  }

  getStatusLabel(percentage: number): string {
    if (percentage >= 70) return 'Aprobado';
    if (percentage >= 50) return 'Suficiente';
    return 'Reprobado';
  }

  getAnswerStatusClass(isCorrect: boolean): string {
    return isCorrect ? 'correct' : 'incorrect';
  }

  getAnswerStatusIcon(isCorrect: boolean): string {
    return isCorrect ? '✅' : '❌';
  }

  goBack(): void {
    this.router.navigate(['/assessment-results']);
  }

  printResults(): void {
    window.print();
  }

  // ===============================================
  // Función agregada para mostrar el tipo de pregunta
  // ===============================================
  getQuestionTypeLabel(type: string): string {
    switch(type) {
      case 'multiple-choice': return 'Opción múltiple';
      case 'true-false': return 'Verdadero/Falso';
      case 'short-answer': return 'Respuesta corta';
      case 'essay': return 'Ensayo';
      default: return 'Desconocido';
    }
  }
}
