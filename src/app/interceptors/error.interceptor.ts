import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocurrió un error inesperado';

        if (error.error instanceof ErrorEvent) {
          // Error del cliente
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Error del servidor
          switch (error.status) {
            case 400:
              errorMessage = error.error?.message || 'Solicitud inválida';
              break;
            case 401:
              errorMessage = 'No autorizado. Por favor inicia sesión';
              break;
            case 403:
              errorMessage = 'No tienes permisos para realizar esta acción';
              break;
            case 404:
              errorMessage = 'Recurso no encontrado';
              break;
            case 500:
              errorMessage = 'Error del servidor. Intenta nuevamente más tarde';
              break;
            default:
              errorMessage = error.error?.message || errorMessage;
          }
        }

        console.error('Error HTTP:', error);
        
        // Aquí podrías mostrar un toast/snackbar global
        // this.notificationService.showError(errorMessage);

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}