import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../../../services/auth.service';

interface UserStats {
  total: number;
  students: number;
  teachers: number;
  admins: number;
}

interface SystemMetric {
  label: string;
  value: string;
  change: number;
  icon: string;
  bgColor: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
   Math = Math;
  user: User | null = null;

  userStats: UserStats = {
    total: 220,
    students: 180,
    teachers: 30,
    admins: 10
  };

  metrics: SystemMetric[] = [
    {
      label: 'Usuarios Registrados',
      value: '220',
      change: 5,
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      bgColor: 'bg-blue-600'
    },
    {
      label: 'Cursos Activos',
      value: '36',
      change: 8,
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13',
      bgColor: 'bg-green-600'
    },
    {
      label: 'Tareas Completadas',
      value: '1,254',
      change: -3,
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      bgColor: 'bg-purple-600'
    },
    {
      label: 'Mensajes del Sistema',
      value: '58',
      change: 12,
      icon: 'M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      bgColor: 'bg-orange-600'
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
