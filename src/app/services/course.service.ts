import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, Enrollment, Lesson } from '../models/course.model';
import { Evaluation } from '../models/evaluation.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:3000/api/courses';

  constructor(private http: HttpClient) {}

  // Obtener todos los cursos (catálogo público)
  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl);
  }

  // Obtener evaluaciones de un curso
  getEvaluationsByCourse(courseId: string): Observable<Evaluation[]> {
  return this.http.get<Evaluation[]>(`${this.apiUrl}/${courseId}/assessments`);
  }


  // Verificar si el usuario está inscrito
  checkEnrollment(courseId: string, userId: string) {
    return this.http.get<{ isEnrolled: boolean }>(
      `${this.apiUrl}/${courseId}/check-enrollment` // ✅ sin duplicar /courses
    );
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

  // Inscribirse a un curso (estudiantes)
  enrollCourse(courseId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${courseId}/enroll`, { userId });
  }

  // Obtener cursos del estudiante actual
  getMyCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/my/courses`); // ✅ ruta limpia
  }

  // Obtener lecciones de un curso
  getCourseLessons(courseId: string): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.apiUrl}/${courseId}/lessons`);
  }

  // Crear lección en un curso (docentes)
  createLesson(courseId: string, lessonData: Partial<Lesson>): Observable<Lesson> {
    return this.http.post<Lesson>(`${this.apiUrl}/${courseId}/lessons`, lessonData);
  }

  // Obtener cursos del docente actual
  getCoursesByTeacher(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/teacher/my-courses`);
  }
}
