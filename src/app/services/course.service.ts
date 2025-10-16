import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, Enrollment, Lesson } from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:3000/api/courses';

  constructor(private http: HttpClient) {}

  // Obtener todos los cursos
  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl);
  }

  // Obtener curso por ID
  getCourseById(id: string): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`);
  }

  // Crear curso (solo docentes)
  createCourse(courseData: Partial<Course>): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, courseData);
  }

  // Actualizar curso
  updateCourse(id: string, courseData: Partial<Course>): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/${id}`, courseData);
  }

  // Eliminar curso
  deleteCourse(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // Inscribirse a un curso
  enrollCourse(courseId: string): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${this.apiUrl}/${courseId}/enroll`, {});
  }

  // Obtener cursos del estudiante
  getMyCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/my-courses`);
  }

  // Obtener lecciones de un curso
  getCourseLessons(courseId: string): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.apiUrl}/${courseId}/lessons`);
  }
}
