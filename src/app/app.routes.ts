import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { EstudianteDashboardComponent } from './pages/dashboard/estudiante/estudiante-dashboard/estudiante-dashboard.component';
import { DocenteDashboardComponent } from './pages/dashboard/docente/docente-dashboard/docente-dashboard.component';
import { AdminDashboardComponent } from './pages/dashboard/admin/admin-dashboard/admin-dashboard.component';
import { CursosListComponent } from './pages/cursos/cursos-list/cursos-list.component';
import { CursoDetailComponent } from './pages/cursos/cursos-detail/cursos-detail.component';
import { PerfilComponent } from './pages/perfil/perfil.component';


export const routes: Routes = [
  // Ruta principal - home
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Páginas públicas
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Dashboard del estudiante
  { path: 'dashboard/estudiante', component: EstudianteDashboardComponent },
  // Dashboard del docente
  { path: 'dashboard/docente', component: DocenteDashboardComponent },
  // Dashboard del administrador
  { path: 'dashboard/admin', component: AdminDashboardComponent },
  // Lista de cursos
  { path: 'cursos', component: CursosListComponent },
  // Detalle de un curso
  { path: 'cursos/:id', component: CursoDetailComponent },
  // Perfil de usuario
  // ✅ Ruta del perfil
  { path: 'perfil/:id', loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent) },


  // Ruta comodín - debe ir siempre al final
  { path: '**', redirectTo: '/home' }
];
