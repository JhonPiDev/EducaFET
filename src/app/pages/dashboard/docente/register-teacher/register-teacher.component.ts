import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../../services/user.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-teacher',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-teacher.component.html'
})
export class RegisterTeacherComponent implements OnInit {
  teacherForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.teacherForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  registerTeacher(): void {
    if (this.teacherForm.invalid) {
      this.teacherForm.markAllAsTouched();
      return;
    }

    const { name, email, password, confirmPassword } = this.teacherForm.value;

    const teacherData = {
      name,
      email,
      password,
      confirmPassword,
      rol: 'docente'
    }; 
    console.log('📤 Datos enviados al backend:', teacherData);

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.userService.register(teacherData).subscribe({
      next: (res) => {
        this.successMessage = 'Docente registrado exitosamente.';
        this.teacherForm.reset();
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al registrar docente.';
        this.loading = false;
      }
    });
  }
}
