import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../../../services/auth.service';
import { CourseService } from '../../../../services/course.service';
import { AssessmentService } from '../../../../services/assessment.service';
import { Course } from '../../../../models/course.model';
import { Assessment } from '../../../../models/assessment.model';

@Component({
  selector: 'app-estudiante-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './estudiante-dashboard.component.html',
})
export class EstudianteDashboardComponent implements OnInit {
  user: User | null = null;
  courses: Course[] = [];
  pendingAssessments: Assessment[] = [];
  loading = true;
  
  stats = {
    activeCourses: 0,
    pendingAssignments: 0,
    averageGrade: 0,
    studyHours: 0
  };

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private assessmentService: AssessmentService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Cargar cursos del estudiante
    this.courseService.getMyCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.stats.activeCourses = courses.length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar cursos:', error);
        this.loading = false;
      }
    });

    // Cargar evaluaciones pendientes
    this.assessmentService.getPendingAssessments().subscribe({
      next: (assessments) => {
        this.pendingAssessments = assessments;
        this.stats.pendingAssignments = assessments.length;
      },
      error: (error) => {
        console.error('Error al cargar evaluaciones:', error);
      }
    });

    // TODO: Obtener promedio y horas de estudio del backend
    this.stats.averageGrade = 4.2;
    this.stats.studyHours = 24;
  }

  logout(): void {
    this.authService.logout();
  }

  getProgressColor(progress: number): string {
    if (progress >= 75) return 'bg-green-600';
    if (progress >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  }

  getAssignmentStatusColor(status: string): string {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getAssignmentStatusLabel(status: string): string {
    switch(status) {
      case 'completed': return 'Completada';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Vencida';
      default: return status;
    }
  }
}