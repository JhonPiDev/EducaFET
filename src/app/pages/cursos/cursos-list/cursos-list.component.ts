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
    
    // 🔹 Simulación de datos de ejemplo
    setTimeout(() => {
      this.courses = [
        {
          id: '1',
          name: 'Matemáticas Avanzadas',
          description: 'Aprende cálculo diferencial e integral con aplicaciones prácticas',
          teacher: 'Prof. García',
          teacherId: '1',
          students: 35,
          duration: '12 semanas',
          level: 'Avanzado',
          category: 'Matemáticas',
          startDate: new Date('2025-01-15'),
          endDate: new Date('2025-04-15'),
          schedule: 'Lun-Mie 10:00 AM',
          status: 'active'
        },
        {
          id: '2',
          name: 'Programación Web',
          description: 'Domina HTML, CSS, JavaScript y frameworks modernos',
          teacher: 'Prof. Martínez',
          teacherId: '2',
          students: 28,
          duration: '16 semanas',
          level: 'Intermedio',
          category: 'Programación',
          startDate: new Date('2025-01-20'),
          endDate: new Date('2025-05-20'),
          schedule: 'Mar-Jue 2:00 PM',
          status: 'active'
        },
        {
          id: '3',
          name: 'Base de Datos',
          description: 'Diseño y gestión de bases de datos relacionales y NoSQL',
          teacher: 'Prof. López',
          teacherId: '3',
          students: 42,
          duration: '10 semanas',
          level: 'Intermedio',
          category: 'Programación',
          startDate: new Date('2025-02-01'),
          endDate: new Date('2025-04-10'),
          schedule: 'Mie 9:00 AM',
          status: 'active'
        },
        {
          id: '4',
          name: 'Introducción a Python',
          description: 'Fundamentos de programación con Python desde cero',
          teacher: 'Prof. Ramírez',
          teacherId: '4',
          students: 55,
          duration: '8 semanas',
          level: 'Básico',
          category: 'Programación',
          startDate: new Date('2025-01-10'),
          endDate: new Date('2025-03-10'),
          schedule: 'Lun-Vie 4:00 PM',
          status: 'active'
        }
      ];
      
      this.filteredCourses = [...this.courses];
      this.loading = false;
    }, 1000);
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

    if (confirm('¿Deseas inscribirte en este curso?')) {
      console.log('Inscribirse al curso:', courseId);
      alert('¡Inscripción exitosa! (Modo demo)');
    }
  }
}
