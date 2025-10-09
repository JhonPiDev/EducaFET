import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

// Interfaces
export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface SocialLoginResponse {
  token: string;
  user: User;
  provider: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth'; // Cambia esto a tu API
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private tokenKey = 'auth_token';
  private userKey = 'current_user';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = this.getUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // ============================================
  // Métodos principales de autenticación
  // ============================================

  /**
   * Login con email y contraseña
   */
  login(email: string, password: string, rememberMe: boolean = false): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      email,
      password,
      rememberMe
    }).pipe(
      tap(response => this.handleAuthSuccess(response, rememberMe)),
      catchError(this.handleError)
    );
  }

  /**
   * Login con redes sociales (Google, Microsoft, etc.)
   */
  socialLogin(provider: 'google' | 'microsoft'): Observable<SocialLoginResponse> {
    // En producción, esto debería abrir una ventana de OAuth
    // Por ahora, simula una petición al backend
    return this.http.post<SocialLoginResponse>(`${this.apiUrl}/social-login`, {
      provider
    }).pipe(
      tap(response => {
        const loginResponse: LoginResponse = {
          token: response.token,
          user: response.user,
          expiresIn: 3600
        };
        this.handleAuthSuccess(loginResponse, false);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Logout
   */
  logout(): void {
    // Limpiar storage
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);

    // Actualizar subject
    this.currentUserSubject.next(null);

    // Redirigir al login
    this.router.navigate(['/auth/login']);
  }

  /**
   * Registro de nuevo usuario
   */
  register(userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => this.handleAuthSuccess(response, false)),
      catchError(this.handleError)
    );
  }

  /**
   * Recuperar contraseña
   */
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, {
      email
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Restablecer contraseña
   */
  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, {
      token,
      newPassword
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ============================================
  // Métodos de utilidad
  // ============================================

  /**
   * Obtener el token actual
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Obtener el usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtener headers con autenticación
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Refrescar token
   */
  refreshToken(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh-token`, {}).pipe(
      tap(response => {
        const storage = localStorage.getItem(this.tokenKey) ? localStorage : sessionStorage;
        storage.setItem(this.tokenKey, response.token);
      }),
      catchError(this.handleError)
    );
  }

  // ============================================
  // Métodos privados
  // ============================================

  /**
   * Manejar éxito de autenticación
   */
  private handleAuthSuccess(response: LoginResponse, rememberMe: boolean): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    // Guardar token
    storage.setItem(this.tokenKey, response.token);
    
    // Guardar usuario
    storage.setItem(this.userKey, JSON.stringify(response.user));
    
    // Actualizar subject
    this.currentUserSubject.next(response.user);
  }

  /**
   * Obtener usuario del storage
   */
  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.userKey);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Verificar si el token expiró
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = payload.exp * 1000;
      return Date.now() >= expirationDate;
    } catch {
      return true;
    }
  }

  /**
   * Manejar errores HTTP
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error inesperado';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
    }

    console.error('Error en AuthService:', error);
    return throwError(() => error);
  }
  
}