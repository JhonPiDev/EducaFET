import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm!: FormGroup;
  loading = false;
  showPassword = false;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}
  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  ngOnInit(): void {
    this.initializeForm();
    this.checkIfAlreadyAuthenticated();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Inicializa el formulario con validaciones */
  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: [
        '', 
        [
          Validators.required, 
          Validators.email,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        ]
      ],
      password: [
        '', 
        [
          Validators.required, 
          Validators.minLength(6)
        ]
      ],
      rememberMe: [false]
    });
  }

  /** Redirige automáticamente si ya hay sesión activa */
  private checkIfAlreadyAuthenticated(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      if (user.role === 'student') {
        sessionStorage.setItem('studentId', user.id);
        this.router.navigate(['/home']);
      } else if (user.role === 'admin') {
        this.router.navigate(['/dashboard']);
      }
    }
  }

  /** Envía las credenciales al backend */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password, rememberMe } = this.loginForm.value;

    this.authService
      .login(email, password, rememberMe)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.handleLoginSuccess(response);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = this.getErrorMessage(error);
          this.handleLoginError(error);
        }
      });
  }

  /** Login con proveedor externo */
  onSocialLogin(provider: 'google' | 'microsoft'): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService
      .socialLogin(provider)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.handleLoginSuccess(response);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = `Error al iniciar sesión con ${this.getProviderName(provider)}.`;
          console.error(`Error en login con ${provider}:`, error);
        }
      });
  }

  /** Mostrar / ocultar contraseña */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /** Éxito en login */
  private handleLoginSuccess(response: any): void {
    const user = response.user; // obtenemos el usuario del login
    console.log('Login exitoso:', user);

    if (user.role === 'estudiante' || user.role === 'student') {
      sessionStorage.setItem('studentId', user.id);
      this.router.navigate(['/home']);
    } else if (user.role === 'admin') {
      this.router.navigate(['/dashboard']);
    }
    else {
      // fallback
      this.router.navigate(['/login']);
    }
  }

  /** Error en login */
  private handleLoginError(error: any): void {
    console.error('Error en login:', error);
    this.loginForm.patchValue({ password: '' }); // limpiar por seguridad
  }

  /** Marca todos los campos como tocados */
  private markAllFieldsAsTouched(): void {
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  /** Mensajes personalizados de error */
  private getErrorMessage(error: any): string {
    if (error.status === 401) return 'Credenciales incorrectas. Verifica tu email y contraseña.';
    if (error.status === 404) return 'Usuario no encontrado. ¿Necesitas registrarte?';
    if (error.status === 403) return 'Tu cuenta está deshabilitada. Contacta a soporte.';
    if (error.status === 429) return 'Demasiados intentos. Espera unos minutos.';
    if (error.status === 0) return 'No se pudo conectar con el servidor. Verifica tu conexión.';
    if (error.error?.message) return error.error.message;

    return 'Ocurrió un error inesperado. Por favor intenta nuevamente.';
  }

  /** Nombre visible del proveedor */
  private getProviderName(provider: 'google' | 'microsoft'): string {
    return provider === 'google' ? 'Google' : 'Microsoft';
  }

  // ==== Getters para el template ====
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get rememberMe() {
    return this.loginForm.get('rememberMe');
  }
}
