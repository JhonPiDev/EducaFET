import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface ForumTopic {
  id: number;
  course_id: number;
  user_id: number;
  title: string;
  content: string;
  author_name: string;
  author_role: string;
  replies_count: number;
  views: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  last_reply_at?: string;
}

export interface ForumReply {
  id: number;
  topic_id: number;
  user_id: number;
  content: string;
  author_name: string;
  author_role: string;
  is_solution: boolean;
  created_at: string;
}

export interface TopicWithReplies extends ForumTopic {
  replies: ForumReply[];
}

@Injectable({
  providedIn: 'root'
})
export class ForumService {
   private apiUrl = 'http://localhost:3000/api/forumsa';

  constructor(private http: HttpClient) {}

  // Obtener temas de un curso
  getTopicsByCourse(courseId: number): Observable<ForumTopic[]> {
    return this.http.get<ForumTopic[]>(`${this.apiUrl}/course/${courseId}`);
  }

  // Obtener tema por ID con respuestas
  getTopicById(topicId: number): Observable<TopicWithReplies> {
    return this.http.get<TopicWithReplies>(`${this.apiUrl}/topic/${topicId}`);
  }

  // Crear tema
  createTopic(data: {
    course_id: number;
    title: string;
    content: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/topic`, data);
  }

  // Crear respuesta
  createReply(data: {
    topic_id: number;
    content: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reply`, data);
  }

  // Marcar respuesta como solución
  markAsSolution(replyId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/reply/${replyId}/solution`, {});
  }

  // Eliminar tema
  deleteTopic(topicId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/topic/${topicId}`);
  }

  // Eliminar respuesta
  deleteReply(replyId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reply/${replyId}`);
  }

  // Obtener temas recientes (útil para el dashboard)
  getRecentTopics(limit: number = 5): Observable<ForumTopic[]> {
    // Esta es una función auxiliar que podría implementarse en el backend
    // Por ahora, puedes filtrar los temas en el frontend
    return this.http.get<ForumTopic[]>(`${this.apiUrl}/recent?limit=${limit}`);
  }
}