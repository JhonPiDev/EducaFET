import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evaluation } from '../models/evaluation.model';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private apiUrl = 'http://localhost:3000/api/evaluations';

  constructor(private http: HttpClient) {}

  // Obtener evaluaciones de un curso
  getEvaluationsByCourse(courseId: string): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/course/${courseId}`);
  }
}
