import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';

interface Feature {
  title: string;
  description: string;
  iconPath: string;
  iconBgClass: string;
}

interface Stat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  userLoggedIn = false;
  user: User | null = null;
  mobileMenuOpen = false;
  currentYear = new Date().getFullYear();

  features = [
    {
      title: 'Cursos Interactivos',
      description: 'Aprende con contenido multimedia y evaluaciones en tiempo real',
      iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      iconBgClass: 'bg-blue-600'
    },
    {
      title: 'Seguimiento de Progreso',
      description: 'Monitorea tu avance académico en tiempo real',
      iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      iconBgClass: 'bg-green-600'
    },
    {
      title: 'Comunicación Directa',
      description: 'Conéctate con docentes y compañeros fácilmente',
      iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      iconBgClass: 'bg-purple-600'
    }
  ];

  stats = [
    { value: '500+', label: 'Estudiantes' },
    { value: '50+', label: 'Docentes' },
    { value: '100+', label: 'Cursos' },
    { value: '95%', label: 'Satisfacción' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Suscribirse al estado de autenticación
    this.authService.currentUser.subscribe(user => {
      this.userLoggedIn = !!user;
      this.user = user;
      
      // Si el usuario ya está logueado, redirigir a su dashboard
      if (user && this.router.url === '/') {
        this.redirectToDashboard(user.role);
      }
    });
  }

  onLogin(): void {
    this.router.navigate(['/login']);
  }

  onRegister(): void {
    this.router.navigate(['/register']);
  }

  onStartFree(): void {
    if (this.userLoggedIn) {
      this.redirectToDashboard(this.user?.role || 'estudiante');
    } else {
      this.router.navigate(['/register']);
    }
  }

  onShowDemo(): void {
    console.log('Mostrar demo');
  }

  logout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  private redirectToDashboard(role: string): void {
    switch (role) {
      case 'estudiante':
        this.router.navigate(['/dashboard/estudiante']);
        break;
      case 'docente':
        this.router.navigate(['/dashboard/docente']);
        break;
      case 'admin':
        this.router.navigate(['/dashboard/admin']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}
