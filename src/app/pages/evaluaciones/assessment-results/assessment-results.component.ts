import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule,RouterLink } from '@angular/router';

interface SubmissionResult {
  assessmentId: string;
  assessmentTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  score: number;
  maxScore: number;
  percentage: number;
  correct: number;
  total: number;
  submittedAt: string;
  timeTaken: string;
  answers: any[];
}

@Component({
  selector: 'app-assessment-results',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterLink],
  templateUrl: './assessment-results.component.html',
  styleUrl: './assessment-results.component.scss'
})
export class AssessmentResultsComponent implements OnInit {
  submissions: SubmissionResult[] = [];
  filteredSubmissions: SubmissionResult[] = [];
  
  // Filtros
  selectedAssessment: string = 'all';
  searchStudent: string = '';
  filterStatus: string = 'all'; // all, passed, failed
  
  assessmentsList: string[] = [];
  loading = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadSubmissions();
  }

  loadSubmissions(): void {
    this.loading = true;
    
    try {
      const raw = sessionStorage.getItem('assessment_submissions');
      
      if (raw) {
        this.submissions = JSON.parse(raw);
        
        // Obtener lista única de evaluaciones
        const uniqueAssessments = [...new Set(this.submissions.map(s => s.assessmentTitle))];
        this.assessmentsList = uniqueAssessments;
        
        this.filteredSubmissions = [...this.submissions];
      } else {
        this.submissions = [];
        this.filteredSubmissions = [];
      }
      
      console.log('Resultados cargados:', this.submissions);
    } catch (error) {
      console.error('Error al cargar resultados:', error);
      this.submissions = [];
      this.filteredSubmissions = [];
    }
    
    this.loading = false;
  }

  applyFilters(): void {
    this.filteredSubmissions = this.submissions.filter(sub => {
      // Filtro por evaluación
      if (this.selectedAssessment !== 'all' && sub.assessmentTitle !== this.selectedAssessment) {
        return false;
      }
      
      // Filtro por estudiante (búsqueda)
      if (this.searchStudent.trim()) {
        const search = this.searchStudent.toLowerCase();
        const matchName = sub.studentName.toLowerCase().includes(search);
        const matchEmail = sub.studentEmail.toLowerCase().includes(search);
        if (!matchName && !matchEmail) {
          return false;
        }
      }
      
      // Filtro por estado (aprobado/reprobado)
      if (this.filterStatus !== 'all') {
        const passed = sub.percentage >= 60;
        if (this.filterStatus === 'passed' && !passed) return false;
        if (this.filterStatus === 'failed' && passed) return false;
      }
      
      return true;
    });
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

  viewDetails(submission: SubmissionResult): void {
    // Guardar la submission seleccionada para ver detalles
    sessionStorage.setItem('selected_submission', JSON.stringify(submission));
    this.router.navigate(['/dashboard/docente/resultados/detalle', submission.assessmentId, submission.studentId]);
  }

  exportToCSV(): void {
    if (this.filteredSubmissions.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const headers = ['Evaluación', 'Estudiante', 'Email', 'Puntaje', 'Porcentaje', 'Estado', 'Fecha'];
    const rows = this.filteredSubmissions.map(sub => [
      sub.assessmentTitle,
      sub.studentName,
      sub.studentEmail,
      `${sub.score}/${sub.maxScore}`,
      `${sub.percentage}%`,
      this.getStatusLabel(sub.percentage),
      new Date(sub.submittedAt).toLocaleString()
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultados_evaluaciones_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  clearAllResults(): void {
    if (confirm('¿Estás seguro de eliminar TODOS los resultados? Esta acción no se puede deshacer.')) {
      sessionStorage.removeItem('assessment_submissions');
      this.loadSubmissions();
      alert('Todos los resultados han sido eliminados');
    }
  }

  getAverageScore(): number {
    if (this.filteredSubmissions.length === 0) return 0;
    const sum = this.filteredSubmissions.reduce((acc, sub) => acc + sub.percentage, 0);
    return Math.round(sum / this.filteredSubmissions.length);
  }

  getPassedCount(): number {
    return this.filteredSubmissions.filter(sub => sub.percentage >= 60).length;
  }

  getFailedCount(): number {
    return this.filteredSubmissions.filter(sub => sub.percentage < 60).length;
  }
    goBack(): void {
    this.router.navigate(['/dashboard/docente']);
  }
}