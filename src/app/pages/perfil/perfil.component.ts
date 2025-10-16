// ============================================
// 📁 pages/perfil/perfil.component.ts (CON SERVICIOS REALES)
// ============================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { UserService, UpdateProfileData, ChangePasswordData, NotificationPreferences } from '../../services/user.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './perfil.component.html' // Usar el template del artifact anterior
})
export class PerfilComponent implements OnInit {
  user: User | null = null;
  activeTab: 'perfil' | 'seguridad' | 'notificaciones' = 'perfil';
  
  // Forms
  profileForm: FormGroup;
  securityForm: FormGroup;
  
  // Loading states
  loading = false;
  loadingSecurity = false;
  
  // Messages
  successMessage = '';
  errorMessage = '';
  securitySuccessMessage = '';
  securityErrorMessage = '';
  
  // Password visibility
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  
  // Notification preferences
  emailNotifications = true;
  pushNotifications = false;
  courseNotifications = true;
  
  // Stats
  memberSince = 'Enero 2025';
  completedCourses = 3;
  teachingCourses = 6;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      bio: ['', [Validators.maxLength(500)]]
    });

    this.securityForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadUserData();
  }

  loadUserData(): void {
    // Cargar datos del backend
    this.userService.getProfile().subscribe({
      next: (userData) => {
        this.profileForm.patchValue({
          name: userData.name,
          email: userData.email,
          phone: (userData as any).telefono || '',
          bio: (userData as any).bio || ''
        });
      },
      error: (error) => {
        console.error('Error al cargar perfil:', error);
        // Fallback a datos locales
        if (this.user) {
          this.profileForm.patchValue({
            name: this.user.name,
            email: this.user.email
          });
        }
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const profileData: UpdateProfileData = this.profileForm.value;

    this.userService.updateProfile(profileData).subscribe({
      next: (response) => {
        this.successMessage = response.message || '¡Perfil actualizado correctamente!';
        this.loading = false;

        // Actualizar usuario en el AuthService
        if (response.user) {
          // Aquí podrías actualizar el usuario en localStorage/sessionStorage
          this.user = response.user;
        }

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al actualizar el perfil';
        this.loading = false;

        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  changePassword(): void {
    if (this.securityForm.invalid) return;

    this.loadingSecurity = true;
    this.securitySuccessMessage = '';
    this.securityErrorMessage = '';

    const passwordData: ChangePasswordData = {
      currentPassword: this.securityForm.value.currentPassword,
      newPassword: this.securityForm.value.newPassword
    };

    this.userService.changePassword(passwordData).subscribe({
      next: (response) => {
        this.securitySuccessMessage = response.message || '¡Contraseña actualizada correctamente!';
        this.securityForm.reset();
        this.loadingSecurity = false;

        setTimeout(() => {
          this.securitySuccessMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.securityErrorMessage = error.error?.message || 'Error al cambiar la contraseña';
        this.loadingSecurity = false;

        setTimeout(() => {
          this.securityErrorMessage = '';
        }, 3000);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }

      // Validar tamaño (máx 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen no debe superar los 2MB');
        return;
      }

      // Subir imagen al backend
      this.userService.updateAvatar(file).subscribe({
        next: (response) => {
          if (this.user) {
            this.user.avatar = response.avatar;
          }
          alert(response.message || 'Imagen actualizada correctamente');
        },
        error: (error) => {
          console.error('Error al subir imagen:', error);
          alert('Error al subir la imagen');
        }
      });
    }
  }

  saveNotificationPreferences(): void {
    const preferences: NotificationPreferences = {
      email: this.emailNotifications,
      push: this.pushNotifications,
      course: this.courseNotifications
    };

    this.userService.updateNotificationPreferences(preferences).subscribe({
      next: (response) => {
        alert(response.message || 'Preferencias guardadas correctamente');
      },
      error: (error) => {
        console.error('Error al guardar preferencias:', error);
        alert('Error al guardar preferencias');
      }
    });
  }

  resetForm(): void {
    this.loadUserData();
    this.successMessage = '';
    this.errorMessage = '';
  }

  resetSecurityForm(): void {
    this.securityForm.reset();
    this.securitySuccessMessage = '';
    this.securityErrorMessage = '';
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.length >= 2
      ? (names[0][0] + names[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }

  getRoleLabel(role?: string): string {
    const labels: { [key: string]: string } = {
      estudiante: 'Estudiante',
      docente: 'Docente',
      admin: 'Administrador'
    };
    return labels[role || 'estudiante'] || 'Usuario';
  }
}