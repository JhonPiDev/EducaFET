import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../../../services/auth.service';
import { CourseService } from '../../../../services/course.service';
import { AssessmentService } from '../../../../services/assessment.service';
import { ForumService, ForumTopic } from '../../../../services/forum.service';
import { Course } from '../../../../models/course.model';
import { Assessment } from '../../../../models/assessment.model';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

// =======================
// INTERFACES DE FORO
// =======================
export interface ForumReply {
  id: number;
  topic_id: number;
  content: string;
  author_name: string;
  author_id: string | null;
  created_at: string;
  is_solution?: boolean;
}

export interface ForumTopicWithReplies extends ForumTopic {
  replies: ForumReply[];
  replies_count: number;
}

@Component({
  selector: 'app-estudiante-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './estudiante-dashboard.component.html',
})
export class EstudianteDashboardComponent implements OnInit {

  user: User | null = null;
  courses: Course[] = [];
  pendingAssessments: Assessment[] = [];
  selectedTopic: ForumTopicWithReplies | null = null;
  newReplyContent = '';

  // 🔵 Actividad reciente (por cursos del estudiante)
  recentForumTopics: ForumTopicWithReplies[] = [];

  // 🟢 Todos los foros creados (para mostrarlos en el dashboard)
  allForumTopics: ForumTopicWithReplies[] = [];

  loading = true;

  notificationCount = 0;
  notifications: { type: string; message: string; date: string }[] = [];
  showNotifications = false;
  unreadCount = 0;


  stats = {
    activeCourses: 0,
    pendingAssignments: 0,
    averageGrade: 0,
    studyHours: 0,
    forumParticipation: 0
  };

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private assessmentService: AssessmentService,
    private forumService: ForumService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadDashboardData();
  }
  calculateStats() {

  // 1. Cursos activos
  this.stats.activeCourses = this.courses.length;


  // 2. Evaluaciones pendientes
  this.stats.pendingAssignments = this.pendingAssessments.length;


  // 3. Calcular promedio de notas (si guardas completado en sessionStorage)
  const completedAssessments = JSON.parse(sessionStorage.getItem('completedAssessments') || '[]');

  if (completedAssessments.length > 0) {
    const total = completedAssessments.reduce((a: number, e: any) => a + (e.score || 0), 0);
    this.stats.averageGrade = Math.round(total / completedAssessments.length);
  } else {
    this.stats.averageGrade = 0;
  }


  // 4. Estimar horas de estudio (1 hora por evaluación completada)
  this.stats.studyHours = completedAssessments.length * 1;


  // 5. Participación en foros: contar respuestas del usuario
  const userId = this.user?.id;
  let repliesCount = 0;

  this.allForumTopics.forEach(t => {
    if (Array.isArray(t.replies)) {
      repliesCount += t.replies.filter(r => r.author_id == userId).length;
    }
  });

  this.stats.forumParticipation = repliesCount;
}
  // =======================
  // NOTIFICACIONES
  // =======================
  loadNotifications() {
    this.notifications = [];
    this.notificationCount = 0;

    this.countAssessmentNotifications();
    this.countForumNotifications();
    this.unreadCount = this.notificationCount;

  }

  countForumNotifications() {
    const stored = sessionStorage.getItem('forumTopics');
    if (!stored) return;

    const topics: ForumTopicWithReplies[] = JSON.parse(stored);

    topics.forEach(t => {
      const newReplies = t.replies.filter(r => {
        return r.author_id !== this.user?.id;  
      });

      newReplies.forEach(r => {
        this.notifications.push({
          type: 'foro',
          message: `Nueva respuesta en: "${t.title}"`,
          date: r.created_at
        });
      });

      this.notificationCount += newReplies.length;
    });
  }

  countAssessmentNotifications() {
    const completed = JSON.parse(sessionStorage.getItem('completedAssessments') || '[]');

    completed.forEach((a: any) => {
      this.notifications.push({
        type: 'evaluacion',
        message: `Has completado la evaluación: ${a.title}`,
        date: a.completed_at || new Date().toISOString()
      });
    });

    this.notificationCount += completed.length;
  }


  // =======================
  // CARGAR DATOS PRINCIPALES
  // =======================
loadDashboardData(): void {
  this.loading = true;

  forkJoin({
    courses: this.courseService.getMyCourses(),
    assessments: this.assessmentService.getPendingAssessments(),
  }).subscribe({
    next: (data) => {
      this.courses = data.courses;
      this.pendingAssessments = data.assessments;

      this.allForumTopics = this.loadForumTopicsFromSessionStorage();

      this.recentForumTopics = this.allForumTopics
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      // 🔥 CALCULAR STATS AQUÍ
      this.calculateStats();
      this.loadNotifications();

      this.loading = false;
    },
    error: (error) => {
      console.error('Error al cargar dashboard:', error);
      this.loading = false;
    }
  });
}


  // =======================
  // FORO - SELECCIONAR TEMA
  // =======================
  openTopic(topicId: number) {
    const topic = this.allForumTopics.find(t => t.id === topicId);
    if (topic) this.selectedTopic = topic;
  }

  backToForumList() {
    this.selectedTopic = null;
    this.newReplyContent = '';
  }

  // =======================
  // FORO - CREAR RESPUESTA
  // =======================
createReply() {
  if (!this.newReplyContent || !this.selectedTopic) return;

  if (!this.selectedTopic.replies) this.selectedTopic.replies = [];

  const newReply: ForumReply = {
    id: Date.now(),
    topic_id: this.selectedTopic.id,
    content: this.newReplyContent,
    author_name: this.user?.name || 'Invitado',
    author_id: this.user?.id || null,
    created_at: new Date().toISOString()
  };

  this.selectedTopic.replies.push(newReply);
  this.selectedTopic.replies_count = this.selectedTopic.replies.length;

  sessionStorage.setItem('forumTopics', JSON.stringify(this.allForumTopics));

  this.newReplyContent = '';
}

  // =======================
  // FOROS POR CURSO (actividad reciente)
  // =======================
  loadForumTopicsForCourses(courses: Course[]): void {
    if (courses.length === 0) return;

    const forumRequests = courses.map(course =>
      this.forumService.getTopicsByCourse(Number(course.id))
    );

    forkJoin(forumRequests).subscribe({
      next: (topicsArrays: ForumTopic[][]) => {
        // Asegurarse que cada topic tenga replies y replies_count para cumplir ForumTopicWithReplies
        const normalized: ForumTopicWithReplies[] = topicsArrays
          .flat()
          .map((t: ForumTopic) => {
            const anyT = t as any;
            const replies: ForumReply[] = Array.isArray(anyT.replies) ? anyT.replies : [];
            const replies_count: number = typeof anyT.replies_count === 'number' ? anyT.replies_count : replies.length;
            return {
              ...t,
              replies,
              replies_count
            } as ForumTopicWithReplies;
          });

        this.recentForumTopics = normalized
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 5);

        const userId = this.user?.id ? Number(this.user.id) : null;
        this.stats.forumParticipation = this.recentForumTopics.filter(
          topic => userId !== null && topic.user_id === userId
        ).length;
      },
      error: (error) => {
        console.error('Error al cargar temas del foro:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  // =======================
  // LEER FOROS DE SESSIONSTORAGE
  // =======================
loadForumTopicsFromSessionStorage(): ForumTopicWithReplies[] {
  const stored = sessionStorage.getItem('forumTopics');
  const topics: any[] = stored ? JSON.parse(stored) : [];

  topics.forEach(t => {
    if (!t.replies) t.replies = [];
    if (!t.replies_count) t.replies_count = t.replies.length;
  });

  return topics as ForumTopicWithReplies[];
}


  // =======================
  // HELPERS UI
  // =======================
  getProgressColor(progress: number): string {
    if (progress >= 75) return 'bg-green-600';
    if (progress >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  }

  getAssignmentStatusColor(status: string): string {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getAssignmentStatusLabel(status: string): string {
    switch(status) {
      case 'completed': return 'Completada';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Vencida';
      default: return status;
    }
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    return past.toLocaleDateString();
  }

  getRoleLabel(role: string): string {
    switch(role) {
      case 'docente': return 'Profesor';
      case 'estudiante': return 'Estudiante';
      case 'admin': return 'Administrador';
      default: return role;
    }
  }

  getRoleBadgeColor(role: string): string {
    switch(role) {
      case 'docente': return 'bg-blue-100 text-blue-800';
      case 'estudiante': return 'bg-gray-100 text-gray-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
