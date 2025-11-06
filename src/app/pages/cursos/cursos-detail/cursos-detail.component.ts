import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService } from '../../../services/course.service';
import { LessonService } from '../../../services/lesson.service';
import { Course } from '../../../models/course.model';
import { Lesson } from '../../../models/lesson.model';
import { AuthService } from '../../../services/auth.service';
import { EvaluationService } from '../../../services/evaluation.service';
import { Evaluation } from '../../../models/evaluation.model';

@Component({
  selector: 'app-curso-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cursos-detail.component.html',
})
export class CursoDetailComponent implements OnInit {
  course: Course | null = null;
  lessons: Lesson[] = [];
  evaluations: Evaluation[] = [];
  loading = true;
  isEnrolled = false;
  isTeacher = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private lessonService: LessonService,
    private authService: AuthService,
    private evaluationService: EvaluationService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.isTeacher = user?.role === 'docente' || user?.role === 'admin';

    const courseId = this.route.snapshot.params['id'];
    this.loadCourseDetails(courseId);
    this.loadLessons(courseId);
    this.loadEvaluations(courseId);
  }

  loadCourseDetails(id: string): void {
    const user = this.authService.getCurrentUser();

    this.courseService.getCourseById(id).subscribe({
      next: (course) => {
        this.course = course;
        this.loading = false;

        if (user && user.role === 'estudiante') {
          this.courseService.checkEnrollment(id, user.id).subscribe({
            next: (res) => this.isEnrolled = res.isEnrolled,
            error: (err) => console.error('Error verificando inscripción:', err)
          });
        }
      },
      error: (error) => {
        console.error('Error cargando curso:', error);
        this.loading = false;
      }
    });
  }


  loadLessons(courseId: string): void {
    this.lessonService.getLessonsByCourse(courseId).subscribe({
      next: (lessons) => {
        this.lessons = lessons;
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }

  loadEvaluations(courseId: string): void {
    this.evaluationService.getEvaluationsByCourse(courseId).subscribe({
      next: (evaluations) => {
        this.evaluations = evaluations;
      },
      error: (error) => console.error('Error cargando evaluaciones:', error)
    });
  }

  enrollCourse(): void {
  if (!this.course) return;

  const user = this.authService.getCurrentUser();
  if (!user) {
    alert('Debes iniciar sesión para inscribirte en un curso.');
    this.router.navigate(['/login']);
    return;
  }

  if (confirm('¿Deseas inscribirte en este curso?')) {
    this.courseService.enrollCourse(this.course.id, user.id).subscribe({
      next: () => {
        this.isEnrolled = true;
        alert('¡Inscripción exitosa!');
      },
      error: (error) => {
        console.error('Error:', error);
        alert(error.error?.message || 'Error al inscribirse');
      }
    });
  }
}


  getCompletedLessonsCount(): number {
    return this.lessons.filter(l => l.completed).length;
  }

  getProgressPercentage(): number {
    if (this.lessons.length === 0) return 0;
    return Math.round((this.getCompletedLessonsCount() / this.lessons.length) * 100);
  }
}