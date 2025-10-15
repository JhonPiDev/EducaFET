import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../../../services/auth.service';

interface CourseProgress {
  id: string;
  name: string;
  progress: number;
  nextClass: string;
  teacher: string;
}

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: Date;
  status: 'pending' | 'completed' | 'overdue';
}

@Component({
  selector: 'app-estudiante-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './estudiante-dashboard.component.html',
})
export class EstudianteDashboardComponent implements OnInit {
  user: User | null = null;
  
  stats = {
    activeCourses: 5,
    pendingAssignments: 8,
    averageGrade: 4.2,
    studyHours: 24
  };

  courses: CourseProgress[] = [
    { id: '1', name: 'Matemáticas Avanzadas', progress: 75, nextClass: 'Lunes 10:00 AM', teacher: 'Prof. García' },
    { id: '2', name: 'Programación Web', progress: 60, nextClass: 'Martes 2:00 PM', teacher: 'Prof. Martínez' },
    { id: '3', name: 'Base de Datos', progress: 85, nextClass: 'Miércoles 9:00 AM', teacher: 'Prof. López' },
  ];

  assignments: Assignment[] = [
    { id: '1', title: 'Tarea de Cálculo', course: 'Matemáticas', dueDate: new Date('2025-10-20'), status: 'pending' },
    { id: '2', title: 'Proyecto Final', course: 'Programación', dueDate: new Date('2025-10-25'), status: 'pending' },
    { id: '3', title: 'Examen Parcial', course: 'Base de Datos', dueDate: new Date('2025-10-15'), status: 'overdue' },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
