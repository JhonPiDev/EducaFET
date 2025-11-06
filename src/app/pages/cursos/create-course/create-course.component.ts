import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CourseService } from '../../../services/course.service';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-course.component.html',
})
export class CreateCourseComponent implements OnInit {
  courseForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  daysOfWeek = [
    { name: 'Lunes', value: 'Lun' },
    { name: 'Martes', value: 'Mar' },
    { name: 'Miércoles', value: 'Mie' },
    { name: 'Jueves', value: 'Jue' },
    { name: 'Viernes', value: 'Vie' },
    { name: 'Sábado', value: 'Sab' },
    { name: 'Domingo', value: 'Dom' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private courseService: CourseService
  ) {
    this.courseForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      level: ['Básico', Validators.required],
      duration: [''],
      days: this.fb.array([], Validators.required),
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      start_date: [''],
      end_date: ['']
    });
  }

  ngOnInit(): void {}

  // ✅ Manejo de días seleccionados
  onDayChange(event: any): void {
    const daysFormArray = this.courseForm.get('days') as FormArray;

    if (event.target.checked) {
      daysFormArray.push(this.fb.control(event.target.value));
    } else {
      const index = daysFormArray.controls.findIndex(x => x.value === event.target.value);
      daysFormArray.removeAt(index);
    }
  }

  // ✅ Genera texto legible del horario
  getFormattedSchedule(): string {
    const days = this.courseForm.value.days?.join(', ');
    const start = this.courseForm.value.start_time;
    const end = this.courseForm.value.end_time;

    if (!days || !start || !end) return '';
    return `${days} - ${this.formatTime(start)} a ${this.formatTime(end)}`;
  }

  private formatTime(time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }

  // ✅ Envío del formulario
  onSubmit(): void {
    if (this.courseForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const courseData = {
      ...this.courseForm.value,
      schedule: this.getFormattedSchedule()
    };

    this.courseService.createCourse(courseData).subscribe({
      next: () => {
        this.successMessage = 'Curso creado exitosamente';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/dashboard/docente']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error al crear curso:', error);
        this.errorMessage = error.error?.message || 'Error al crear el curso';
        this.loading = false;
      }
    });
  }
}
