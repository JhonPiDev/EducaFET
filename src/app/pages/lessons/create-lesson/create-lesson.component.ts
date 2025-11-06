import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LessonService } from '../../../services/lesson.service';

@Component({
  selector: 'app-create-lesson',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-lesson.component.html',
})
export class CreateLessonComponent implements OnInit {
  lessonForm: FormGroup;
  courseId: string = '';
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private lessonService: LessonService
  ) {
    this.lessonForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      content: ['', Validators.required],
      order_num: [0],
      duration: [0],
      video_url: ['']
    });
  }

  ngOnInit(): void {
    this.courseId = this.route.snapshot.params['courseId'];
  }

  onSubmit(): void {
    if (this.lessonForm.invalid) {
      this.errorMessage = 'Por favor completa los campos requeridos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const lessonData = {
      ...this.lessonForm.value,
      course_id: this.courseId
    };

    this.lessonService.createLesson(lessonData).subscribe({
      next: (response) => {
        this.successMessage = 'Lección creada exitosamente';
        this.loading = false;
        
        setTimeout(() => {
          this.router.navigate(['/cursos', this.courseId]);
        }, 1500);
      },
      error: (error) => {
        console.error('Error:', error);
        this.errorMessage = error.error?.message || 'Error al crear lección';
        this.loading = false;
      }
    });
  }
}