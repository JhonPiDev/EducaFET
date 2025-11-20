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
import { TakeAssessmentComponent } from './pages/evaluaciones/take-assessment/take-assessment.component';
import { CreateAssessmentComponent } from './pages/evaluaciones/create-assessment/create-assessment.component';
import { RegisterTeacherComponent } from './pages/dashboard/docente/register-teacher/register-teacher.component';
import { CreateCourseComponent } from './pages/cursos/create-course/create-course.component';
import { LessonViewComponent } from './pages/lessons/lesson-view/lesson-view.component';
import { CreateLessonComponent } from './pages/lessons/create-lesson/create-lesson.component';
import { GradeSubmissionsComponent } from './pages/evaluaciones/grade-submissions/grade-submissions.component';
import { EvaluacionesListComponent } from './pages/evaluaciones/evaluaciones-list/evaluaciones-list.component';
import { ForumComponent } from './pages/cursos/forum/forum.component';

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
  // Crear evaluación (docente)
  { path: 'evaluaciones/crear', component: CreateAssessmentComponent },
  // Registrar docente (admin)
  { path: 'dashboard/docente/registrar', component: RegisterTeacherComponent },
  // Crear curso (docente)
  { path: 'dashboard/cursos-create', component: CreateCourseComponent },
  // Ver lección
  { path: 'lessons/:id', component: LessonViewComponent },
  // Crear lección (docente)
  { path: 'cursos/:courseId/lecciones/crear', component: CreateLessonComponent },
  // Calificar entregas (docente)
  { path: 'evaluaciones/:id/calificar', component: GradeSubmissionsComponent },
  // Evaluaciones
{
  path: 'evaluaciones',
  component: EvaluacionesListComponent
},
{
  path: 'take-assessment/:id',
  component: TakeAssessmentComponent
},

  // Foro del curso
  { path : 'foros', component: ForumComponent },

  // Perfil de usuario
  // ✅ Ruta del perfil
  { path: 'perfil/:id', loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent) },
  // Tomar evaluación



  // Ruta comodín - debe ir siempre al final
  { path: '**', redirectTo: '/home' }
];
