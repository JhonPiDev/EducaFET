import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, Router } from '@angular/router';
import { AuthService, User } from '../../../../services/auth.service';
import { CourseService } from '../../../../services/course.service';
import { Course } from '../../../../models/course.model';
import { AssessmentService } from '../../../../services/assessment.service';

interface DashboardStats {
  activeCourses: number;
  totalStudents: number;
  pendingReviews: number;
  averageGrade: number;
}

@Component({
  selector: 'app-docente-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './docente-dashboard.component.html',
})
export class DocenteDashboardComponent implements OnInit {
  user: User | null = null;
  courses: Course[] = [];
  loading = true;
  pendingAssessments: any[] = [];

  
  stats: DashboardStats = {
    activeCourses: 0,
    totalStudents: 0,
    pendingReviews: 0,
    averageGrade: 0
  };

  recentActivities: any[] = [];

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private assessmentService: AssessmentService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadMyCourses();
    this.loadPendingSubmissions();
  }
  // Agregar en el ngOnInit o en un método separado
loadPendingSubmissions(): void {
  this.assessmentService.getPendingSubmissions().subscribe({
    next: (count) => {
      this.stats.pendingReviews = count;
    },
    error: (error) => console.error('Error:', error)
  });
}

  loadMyCourses(): void {
    this.loading = true;

    this.courseService.getMyCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.calculateStats(courses);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar cursos:', error);
        this.loading = false;
      }
    });
  }

  calculateStats(courses: Course[]): void {
    this.stats.activeCourses = courses.length;
    
    // Calcular total de estudiantes
    this.stats.totalStudents = courses.reduce((total, course) => {
      return total + (course.students || 0);
    }, 0);

    // TODO: Obtener del backend
    this.stats.pendingReviews = 23;
    this.stats.averageGrade = 4.3;
  }

  logout(): void {
    this.authService.logout();
  }

  getInitials(name: string): string {
    const names = name.split(' ');
    return names.length >= 2 
      ? (names[0][0] + names[1][0]).toUpperCase()
      : name[0].toUpperCase();
  }
}