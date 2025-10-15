import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const user = this.authService.getCurrentUser();
    
    if (this.authService.isAuthenticated() && user) {
      // Verificar roles si están definidos en la ruta
      const expectedRoles = route.data['roles'] as string[];
      
      if (expectedRoles && !expectedRoles.includes(user.role)) {
        // Usuario no tiene el rol requerido, redirigir a su dashboard
        this.redirectToDashboard(user.role);
        return false;
      }
      
      return true;
    }

    // Usuario no autenticado, redirigir al login
    this.router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }

  private redirectToDashboard(role: string): void {
    switch (role) {
      case 'estudiante':
        this.router.navigate(['/dashboard/estudiante']);
        break;
      case 'docente':
        this.router.navigate(['/dashboard/docente']);
        break;
      case 'admin':
        this.router.navigate(['/dashboard/admin']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}