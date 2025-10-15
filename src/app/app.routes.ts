import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { EstudianteDashboardComponent } from './pages/dashboard/estudiante/estudiante-dashboard/estudiante-dashboard.component';

export const routes: Routes = [
  // Ruta principal - home
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Páginas públicas
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Dashboard del estudiante
  { path: 'dashboard/estudiante', component: EstudianteDashboardComponent },

  // Ruta comodín - debe ir siempre al final
  { path: '**', redirectTo: '/login' }
];
