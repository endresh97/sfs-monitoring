import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { ApiErrorService } from '../services/api-error.service';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const apiErrorService = inject(ApiErrorService);

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        apiErrorService.clearError();
      }
    }),
    catchError((error: HttpErrorResponse) => {
      let message = 'Something went wrong while communicating with the server.';

      if (error.status === 0) {
        message =
          'Unable to connect to the server. Please check your network connection.';
      } else if (error.status === 404) {
        message = 'The requested resource could not be found.';
      } else if (error.status >= 500) {
        message =
          'The server is currently unavailable. Please try again later.';
      }

      apiErrorService.showError(message);

      return throwError(() => error);
    }),
  );
};
