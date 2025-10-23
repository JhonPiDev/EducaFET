import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service'; // 👈 Importa tu AuthService

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService // 👈 Inyectamos el servicio
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  goToRegister(): void {
    this.router.navigate(['/login']);
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      rol: ['estudiante', Validators.required],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  get nombre() { return this.registerForm.get('nombre'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get rol() { return this.registerForm.get('rol'); }
  get acceptTerms() { return this.registerForm.get('acceptTerms'); }

  togglePasswordVisibility(): void { this.showPassword = !this.showPassword; }
  toggleConfirmPasswordVisibility(): void { this.showConfirmPassword = !this.showConfirmPassword; }

  getPasswordStrength(): number {
    const password = this.password?.value || '';
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  }

  getPasswordStrengthColor(index: number): string {
    const strength = this.getPasswordStrength();
    if (index >= strength) return 'bg-gray-200';
    return ['bg-red-500','bg-orange-500','bg-yellow-500','bg-green-500'][strength-1];
  }

  getPasswordStrengthText(): string {
    switch(this.getPasswordStrength()) {
      case 1: return 'Débil';
      case 2: return 'Media';
      case 3: return 'Fuerte';
      case 4: return 'Muy fuerte';
      default: return 'Débil';
    }
  }

  // =====================================================
  // 🚀 Registro de usuario usando AuthService
  // =====================================================
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formData = {
      name: this.nombre?.value, // 👈 Cambiado a "name" para coincidir con el AuthService
      email: this.email?.value,
      password: this.password?.value,
      confirmPassword: this.confirmPassword?.value,
      rol: this.rol?.value 
    };

    console.log('📤 Datos enviados al backend:', formData);

    this.authService.register(formData).subscribe({
      next: (res) => {
        this.loading = false;
        console.log('✅ Usuario registrado correctamente:', res);
        this.router.navigate(['/home']); // Redirige al login
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Error al registrar usuario:', err);
        if (err.status === 409) {
          this.errorMessage = 'El correo electrónico ya está registrado.';
        } else {
          this.errorMessage = err.error?.message || 'Error al registrar usuario. Intenta nuevamente.';
        }
      }
    });
  }

  // =====================================================
  // 🌐 Registro con redes sociales
  // =====================================================
  onSocialRegister(provider: string): void {
    console.log(`Intentando registrar con ${provider}...`);
    this.loading = true;

    this.authService.socialLogin(provider as 'google' | 'microsoft').subscribe({
      next: (res) => {
        console.log('✅ Registro social exitoso:', res);
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Error en login social:', err);
        this.errorMessage = `Error al conectar con ${provider}.`;
      }
    });
  }
}
