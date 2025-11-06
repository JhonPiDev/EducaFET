import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../services/course.service';
import { Course } from '../../../models/course.model';
import { AuthService, User } from '../../../services/auth.service';

@Component({
  selector: 'app-cursos-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cursos-list.component.html',
  styleUrls: ['./cursos-list.component.scss']
})
export class CursosListComponent implements OnInit {
  user: User | null = null;
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  loading = false;

  searchTerm = '';
  selectedCategory = '';
  selectedLevel = '';

  constructor(
    private courseService: CourseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadCourses();
  }

  loadCourses(): void {
  this.loading = true;
  this.courseService.getCourses().subscribe({
    next: (data) => {
      this.courses = data;
      this.filteredCourses = [...data];
      this.loading = false;
    },
    error: (err) => {
      console.error('Error al obtener cursos:', err);
      this.loading = false;
    }
  });
}



  filterCourses(): void {
    this.filteredCourses = this.courses.filter(course => {
      const matchesSearch = !this.searchTerm || 
        course.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        course.teacher.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = !this.selectedCategory || 
        course.category === this.selectedCategory;
      
      const matchesLevel = !this.selectedLevel || 
        course.level === this.selectedLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }

 enrollCourse(courseId: string, event: Event): void {
  event.preventDefault();
  event.stopPropagation();

  if (!this.user) {
    alert('Debes iniciar sesión para inscribirte');
    return;
  }

  if (confirm('¿Deseas inscribirte en este curso?')) {
    this.courseService.enrollCourse(courseId, this.user.id).subscribe({
      next: () => {
        alert('¡Inscripción exitosa!');
        this.loadCourses(); // recargar cursos actualizados
      },
      error: (err) => {
        const msg = err.error?.message || 'Error al inscribirse';
        alert(msg);
      }
    });
  }
}
}
