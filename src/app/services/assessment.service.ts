import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Assessment, 
  Submission, 
  CreateAssessmentData, 
  SubmitAssessmentData, 
  GradeSubmissionData 
} from '../models/assessment.model';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private apiUrl = 'http://localhost:3000/api/assessments';

  constructor(private http: HttpClient) {}

  /**
   * Crear evaluación (solo docentes)
   */
  createAssessment(assessmentData: CreateAssessmentData): Observable<{ message: string; assessment: Assessment }> {
    return this.http.post<{ message: string; assessment: Assessment }>(this.apiUrl, assessmentData);
  }

  /**
   * Obtener evaluación por ID
   */
  getAssessmentById(id: string): Observable<Assessment> {
    return this.http.get<Assessment>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener evaluaciones de un curso
   */
  getAssessmentsByCourse(courseId: string): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(`${this.apiUrl}/course/${courseId}`);
  }

  /**
   * Obtener evaluaciones pendientes (estudiantes)
   */
  getPendingAssessments(): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(`${this.apiUrl}/student/pending`);
  }

  /**
   * Enviar respuestas de evaluación (estudiantes)
   */
  submitAssessment(assessmentId: string, submissionData: SubmitAssessmentData): Observable<{ 
    message: string; 
    submission_id: string;
    score?: number;
    max_score?: number;
  }> {
    return this.http.post<any>(`${this.apiUrl}/${assessmentId}/submit`, submissionData);
  }

  /**
   * Obtener envíos de una evaluación (docentes)
   */
  getSubmissions(assessmentId: string): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.apiUrl}/${assessmentId}/submissions`);
  }

  /**
   * Calificar envío (docentes)
   */
  gradeSubmission(submissionId: string, gradeData: GradeSubmissionData): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/submissions/${submissionId}/grade`, gradeData);
  }

  /**
   * Obtener historial de evaluaciones del estudiante
   */
  getStudentHistory(): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.apiUrl}/student/history`);
  }

  /**
   * Obtener tipo de evaluación en español
   */
  getAssessmentTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      quiz: 'Quiz',
      exam: 'Examen',
      assignment: 'Tarea'
    };
    return labels[type] || type;
  }

  /**
   * Obtener tipo de pregunta en español
   */
  getQuestionTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      multiple_choice: 'Selección Múltiple',
      true_false: 'Verdadero/Falso',
      short_answer: 'Respuesta Corta',
      essay: 'Ensayo'
    };
    return labels[type] || type;
  }

  /**
   * Calcular tiempo restante
   */
  getTimeRemaining(dueDate: Date | null): string {
    if (!dueDate) return 'Sin fecha límite';

    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();

    if (diff < 0) return 'Vencido';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''}`;
    return 'Menos de 1 hora';
  }

  /**
   * Verificar si está vencida
   */
  isOverdue(dueDate: Date | null): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }

  /**
   * Calcular porcentaje
   */
  calculatePercentage(score: number, maxScore: number): number {
    if (maxScore === 0) return 0;
    return Math.round((score / maxScore) * 100);
  }
}