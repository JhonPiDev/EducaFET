import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lesson } from '../models/lesson.model';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private apiUrl = 'http://localhost:3000/api/lessons';

  constructor(private http: HttpClient) {}

  getLessonsByCourse(courseId: string): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.apiUrl}/course/${courseId}`);
  }

  getLessonById(id: string): Observable<Lesson> {
    return this.http.get<Lesson>(`${this.apiUrl}/${id}`);
  }

  createLesson(lessonData: Partial<Lesson>): Observable<{ message: string; lesson: Lesson }> {
    return this.http.post<{ message: string; lesson: Lesson }>(this.apiUrl, lessonData);
  }

  updateLesson(id: string, lessonData: Partial<Lesson>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, lessonData);
  }

  deleteLesson(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  completeLesson(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/complete`, {});
  }
}