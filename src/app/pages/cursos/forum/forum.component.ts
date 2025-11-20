import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

// Interfaces
export interface ForumReply {
  id: number;
  topic_id: number;
  content: string;
  author_name: string;
  author_id: string | null;
  created_at: string;
  is_solution?: boolean;
}

export interface ForumTopic {
  id: number;
  course_id: number;
  title: string;
  content: string;
  author_name: string;
  author_id: string | null;
  created_at: string;
  replies: ForumReply[];
  replies_count: number;
}

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.scss']
})
export class ForumComponent implements OnInit {
  loading = false;
  error: string | null = null;
  topics: ForumTopic[] = [];
  selectedTopic: ForumTopic | null = null;

  courseId = 1; // Cambiar según curso
  newTopicTitle = '';
  newTopicContent = '';
  newReplyContent = '';

  currentUser: { id: string | null; name: string; role: string } = { id: null, name: '', role: '' };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loading = true;

    // Obtener usuario desde sessionStorage
    const userData = sessionStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    } else {
      this.currentUser = { id: null, name: 'Invitado', role: 'guest' };
    }

    this.loadTopics();
  }

  // Cargar temas desde sessionStorage
  loadTopics() {
    const stored = sessionStorage.getItem('forumTopics');
    this.topics = stored ? JSON.parse(stored) : [];
    this.loading = false;
  }

  // Guardar en sessionStorage
  saveTopics() {
    sessionStorage.setItem('forumTopics', JSON.stringify(this.topics));
  }

  // Abrir un tema
  openTopic(topicId: number) {
    const topic = this.topics.find(t => t.id === topicId);
    if (topic) this.selectedTopic = topic;
  }

  // Volver a la lista de temas
  backToTopics() {
    this.selectedTopic = null;
    this.newReplyContent = '';
  }

  // Crear nuevo tema
  createTopic() {
    if (!this.newTopicTitle || !this.newTopicContent) return;

    const newTopic: ForumTopic = {
      id: Date.now(),
      course_id: this.courseId,
      title: this.newTopicTitle,
      content: this.newTopicContent,
      author_name: this.currentUser.name,
      author_id: this.currentUser.id,
      created_at: new Date().toISOString(),
      replies: [],
      replies_count: 0
    };

    this.topics.push(newTopic);
    this.saveTopics();

    this.newTopicTitle = '';
    this.newTopicContent = '';
  }

  // Crear nueva respuesta
  createReply() {
    if (!this.newReplyContent || !this.selectedTopic) return;

    const newReply: ForumReply = {
      id: Date.now(),
      topic_id: this.selectedTopic.id,
      content: this.newReplyContent,
      author_name: this.currentUser.name,
      author_id: this.currentUser.id,
      created_at: new Date().toISOString()
    };

    this.selectedTopic.replies.push(newReply);
    this.selectedTopic.replies_count = this.selectedTopic.replies.length;
    this.saveTopics();

    this.newReplyContent = '';
  }

  // Volver al dashboard según rol
  goToDashboard() {
    const role = this.currentUser.role.toLowerCase();
    switch (role) {
      case 'estudiante':
      case 'student':
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
