import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CourseService } from '../../../services/course.service';
import { Course, Lesson } from '../../../models/course.model';

@Component({
  selector: 'app-curso-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cursos-detail.component.html',
})
export class CursoDetailComponent implements OnInit {
  course: Course | null = null;
  lessons: Lesson[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCourse(id);
    }
  }

  loadCourse(id: string): void {
    this.loading = true;

    // 🔹 Simulación - en producción usa courseService.getCourseById(id)
    setTimeout(() => {
  // Simulación del curso seleccionado según su ID
  switch (id) {
    case '1':
      this.course = {
        id,
        name: 'Matemáticas Avanzadas',
        description: 'Aprende cálculo diferencial e integral con aplicaciones prácticas.',
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
      };

      this.lessons = [
        { id: '1', courseId: id, order: 1, duration: '25 min', title: 'Límites y Continuidad', description: 'Conceptos básicos de límites y funciones continuas.', content: '#' },
        { id: '2', courseId: id, order: 2, duration: '30 min', title: 'Derivadas', description: 'Definición y aplicaciones de la derivada.', content: '#' },
        { id: '3', courseId: id, order: 3, duration: '40 min', title: 'Integrales Definidas', description: 'Técnicas de integración y área bajo la curva.', content: '#' },
        { id: '4', courseId: id, order: 4, duration: '35 min', title: 'Ecuaciones Diferenciales', description: 'Resolución de ecuaciones diferenciales básicas.', content: '#' }
      ];
      break;

    case '2':
      this.course = {
        id,
        name: 'Programación Web',
        description: 'Domina HTML, CSS, JavaScript y frameworks modernos.',
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
      };

      this.lessons = [
        { id: '1', courseId: id, order: 1, duration: '20 min', title: 'Estructura HTML', description: 'Aprende las etiquetas fundamentales de HTML.', content: '#' },
        { id: '2', courseId: id, order: 2, duration: '25 min', title: 'Estilos con CSS', description: 'Cómo aplicar estilos, colores y diseño responsivo.', content: '#' },
        { id: '3', courseId: id, order: 3, duration: '30 min', title: 'Fundamentos de JavaScript', description: 'Variables, funciones y manipulación del DOM.', content: '#' },
        { id: '4', courseId: id, order: 4, duration: '35 min', title: 'Frameworks Modernos', description: 'Introducción a Angular y React.', content: '#' }
      ];
      break;

    case '3':
      this.course = {
        id,
        name: 'Base de Datos',
        description: 'Diseño y gestión de bases de datos relacionales y NoSQL.',
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
      };

      this.lessons = [
        { id: '1', courseId: id, order: 1, duration: '20 min', title: 'Modelo Relacional', description: 'Conceptos básicos del modelo entidad-relación.', content: '#' },
        { id: '2', courseId: id, order: 2, duration: '25 min', title: 'SQL Básico', description: 'Consultas SELECT, INSERT, UPDATE y DELETE.', content: '#' },
        { id: '3', courseId: id, order: 3, duration: '30 min', title: 'Normalización', description: 'Evita la redundancia de datos mediante normalización.', content: '#' },
        { id: '4', courseId: id, order: 4, duration: '35 min', title: 'Bases NoSQL', description: 'Introducción a MongoDB y estructuras no relacionales.', content: '#' }
      ];
      break;

    case '4':
      this.course = {
        id,
        name: 'Introducción a Python',
        description: 'Fundamentos de programación con Python desde cero.',
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
      };

      this.lessons = [
        { id: '1', courseId: id, order: 1, duration: '15 min', title: 'Introducción a Python', description: 'Conoce la historia y sintaxis básica del lenguaje.', content: '#' },
        { id: '2', courseId: id, order: 2, duration: '20 min', title: 'Variables y Tipos de Datos', description: 'Aprende a trabajar con variables y diferentes tipos de datos.', content: '#' },
        { id: '3', courseId: id, order: 3, duration: '25 min', title: 'Estructuras de Control', description: 'Usa condicionales y bucles para controlar el flujo de tu programa.', content: '#' },
        { id: '4', courseId: id, order: 4, duration: '18 min', title: 'Funciones en Python', description: 'Define y utiliza funciones para organizar tu código.', content: '#' }
      ];
      break;
  }

  this.loading = false;
}, 1000);

  }

  enrollCourse(): void {
    if (confirm('¿Deseas inscribirte en este curso?')) {
      alert('¡Inscripción exitosa! (Modo demo)');
    }
  }
}
