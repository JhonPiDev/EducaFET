import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './auth.service';

export interface UpdateProfileData {
  name: string;
  email: string;
  phone?: string;
  bio?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  course: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  /**
   * Obtener perfil del usuario actual
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  /**
   * Actualizar perfil
   */
  updateProfile(profileData: UpdateProfileData): Observable<{ message: string; user: User }> {
    return this.http.put<{ message: string; user: User }>(`${this.apiUrl}/profile`, profileData);
  }

  /**
   * Cambiar contraseña
   */
  changePassword(passwordData: ChangePasswordData): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/change-password`, passwordData);
  }

  /**
   * Actualizar avatar
   */
  updateAvatar(file: File): Observable<{ message: string; avatar: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.http.post<{ message: string; avatar: string }>(`${this.apiUrl}/avatar`, formData);
  }

  /**
   * Actualizar preferencias de notificaciones
   */
  updateNotificationPreferences(preferences: NotificationPreferences): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/notification-preferences`, preferences);
  }

  /**
   * Obtener todos los usuarios (solo admin)
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Obtener usuario por ID
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Eliminar usuario (solo admin)
   */
  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}