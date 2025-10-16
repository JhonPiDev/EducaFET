import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../../../services/auth.service';

interface Course {
  id: string;
  name: string;
  students: number;
  nextClass: string;
  completionRate: number;
}

interface RecentActivity {
  id: string;
  student: string;
  action: string;
  course: string;
  time: Date;
}

@Component({
  selector: 'app-docente-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './docente-dashboard.component.html',
})
export class DocenteDashboardComponent implements OnInit {
  user: User | null = null;
  
  stats = {
    activeCourses: 6,
    totalStudents: 142,
    pendingReviews: 23,
    averageGrade: 4.3
  };

  courses: Course[] = [
    { id: '1', name: 'Matemáticas Avanzadas', students: 35, nextClass: 'Lunes 10:00 AM', completionRate: 68 },
    { id: '2', name: 'Programación Web', students: 28, nextClass: 'Martes 2:00 PM', completionRate: 72 },
    { id: '3', name: 'Base de Datos', students: 42, nextClass: 'Miércoles 9:00 AM', completionRate: 85 },
    { id: '4', name: 'Inteligencia Artificial', students: 37, nextClass: 'Jueves 11:00 AM', completionRate: 55 },
  ];

  recentActivities: RecentActivity[] = [
    { id: '1', student: 'Juan Pérez', action: 'Entregó tarea', course: 'Matemáticas', time: new Date('2025-10-14T10:30:00') },
    { id: '2', student: 'María García', action: 'Completó evaluación', course: 'Programación', time: new Date('2025-10-14T09:15:00') },
    { id: '3', student: 'Carlos López', action: 'Comentó en el foro', course: 'Base de Datos', time: new Date('2025-10-14T08:45:00') },
    { id: '4', student: 'Ana Martínez', action: 'Vio el material', course: 'IA', time: new Date('2025-10-13T16:20:00') },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
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