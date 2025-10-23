// ============================================
// 📁 pages/evaluaciones/create-assessment/create-assessment.component.ts
// ============================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AssessmentService } from '../../../services/assessment.service';
import { CourseService } from '../../../services/course.service';
import { Course } from '../../../models/course.model';

@Component({
  selector: 'app-create-assessment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-assessment.component.html',
})
export class CreateAssessmentComponent implements OnInit {
  assessmentForm: FormGroup;
  courses: Course[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private assessmentService: AssessmentService,
    private courseService: CourseService
  ) {
    this.assessmentForm = this.fb.group({
      course_id: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      type: ['quiz', Validators.required],
      due_date: [''],
      max_score: [100, [Validators.required, Validators.min(1)]],
      time_limit: [''],
      attempts_allowed: [1, [Validators.required, Validators.min(1)]],
      questions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadCourses();

  }

  get questions(): FormArray {
    return this.assessmentForm.get('questions') as FormArray;
  }

  loadCourses(): void {
    // En producción usar: this.courseService.getMyCourses()
    // Por ahora datos simulados
    this.courses = [
      { id: '1', name: 'Matemáticas Avanzadas' } as Course,
      { id: '2', name: 'Programación Web' } as Course,
      { id: '3', name: 'Base de Datos' } as Course
    ];
  }

  addQuestion(): void {
    const questionGroup = this.fb.group({
      question_text: ['', Validators.required],
      question_type: ['multiple_choice', Validators.required],
      options_text: [''], // Para almacenar temporalmente las opciones como texto
      correct_answer: ['', Validators.required],
      points: [1, [Validators.required, Validators.min(1)]]
    });

    this.questions.push(questionGroup);
  }

  removeQuestion(index: number): void {
    if (confirm('¿Estás seguro de eliminar esta pregunta?')) {
      this.questions.removeAt(index);
    }
  }

  getQuestionType(index: number): string {
    return this.questions.at(index).get('question_type')?.value;
  }

  onQuestionTypeChange(index: number): void {
    const questionType = this.getQuestionType(index);
    const questionGroup = this.questions.at(index);

    // Limpiar campos según el tipo
    if (questionType === 'true_false') {
      questionGroup.patchValue({
        options_text: '',
        correct_answer: ''
      });
    } else if (questionType === 'multiple_choice') {
      questionGroup.patchValue({
        correct_answer: ''
      });
    }
  }

  onSubmit(): void {
    if (this.assessmentForm.invalid || this.questions.length === 0) {
      this.errorMessage = 'Por favor completa todos los campos requeridos y agrega al menos una pregunta';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formValue = this.assessmentForm.value;

    // Procesar preguntas
    const processedQuestions = formValue.questions.map((q: any) => {
      let options = null;

      // Procesar opciones según el tipo
      if (q.question_type === 'multiple_choice') {
        // Convertir texto de opciones a array
        options = q.options_text
          .split('\n')
          .map((opt: string) => opt.trim())
          .filter((opt: string) => opt.length > 0);
      } else if (q.question_type === 'true_false') {
        options = ['Verdadero', 'Falso'];
      }

      return {
        question_text: q.question_text,
        question_type: q.question_type,
        options: options,
        correct_answer: q.correct_answer,
        points: q.points
      };
    });

    // Preparar datos para enviar
    const assessmentData = {
      course_id: formValue.course_id,
      title: formValue.title,
      description: formValue.description,
      type: formValue.type,
      due_date: formValue.due_date || null,
      max_score: formValue.max_score,
      time_limit: formValue.time_limit || null,
      attempts_allowed: formValue.attempts_allowed,
      questions: processedQuestions
    };

    console.log('📦 Datos listos para enviar al backend:', assessmentData);
    console.log('🧩 Preguntas procesadas:', processedQuestions);

    this.assessmentService.createAssessment(assessmentData).subscribe({
      next: (response) => {
        console.log('✅ Respuesta del backend:', response);
        alert('Evaluación creada exitosamente');
        this.router.navigate(['/dashboard/docente']);
      },
      error: (error) => {
        console.error('Error al crear evaluación:', error);
        this.errorMessage = error.error?.message || 'Error al crear la evaluación';
        this.loading = false;
      }
    });
  }
}