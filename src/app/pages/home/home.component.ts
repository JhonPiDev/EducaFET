import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
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
  imports: [CommonModule, RouterModule, RouterLink ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  userLoggedIn = false;
  user: User | null = null;
  mobileMenuOpen = false;
  currentYear = new Date().getFullYear();

  features: Feature[] = [
    {
      title: 'Cursos Interactivos',
      description: 'Aprende con contenido multimedia y evaluaciones en tiempo real',
      iconPath:
        'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      iconBgClass: 'bg-blue-600'
    },
    {
      title: 'Seguimiento de Progreso',
      description: 'Monitorea tu avance académico en tiempo real',
      iconPath:
        'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      iconBgClass: 'bg-green-600'
    },
    {
      title: 'Comunicación Directa',
      description: 'Conéctate con docentes y compañeros fácilmente',
      iconPath:
        'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      iconBgClass: 'bg-purple-600'
    }
  ];

  stats: Stat[] = [
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
    // Suscribirse al estado del usuario
    this.authService.currentUser.subscribe(user => {
      this.userLoggedIn = !!user;
      this.user = user;

      // Si el usuario ya está logueado y está en la raíz, redirigir
      if (user && this.router.url === '/') {
        this.redirectToDashboard(user.role);
      }
    });
  }

  goToProfile(): void {
  if (this.user?.id) {
    this.router.navigate(['/perfil', this.user.id]);
  }
}


  /** 🔹 Iniciar sesión */
  onLogin(): void {
    this.router.navigate(['/login']);
  }

  /** 🔹 Registrarse */
  onRegister(): void {
    this.router.navigate(['/register']);
  }

  /** 🔹 Empezar curso gratuito */
  onStartFree(): void {
  if (!this.userLoggedIn) {
    // 🔹 No está logueado → ir al login
    this.router.navigate(['/login']);
  } else {
    // 🔹 Está logueado → ir al dashboard según rol
    const role = this.user?.role || 'estudiante';
    this.redirectToDashboard(role);
  }
}

  /** 🔹 Cerrar sesión */
  logout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  /** 🔹 Obtener iniciales del nombre */
  getInitials(name?: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }

  /** 🔹 Menú móvil */
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  /** 🔹 Redirigir al dashboard según rol */
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
        break;
    }
  }
}
