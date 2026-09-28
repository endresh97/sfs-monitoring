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
      let message = 'ERROR.GENERIC';

      if (error.status === 0) {
        message = 'ERROR.NETWORK';
      } else if (error.status === 404) {
        message = 'ERROR.NOT_FOUND';
      } else if (error.status >= 500) {
        message = 'ERROR.SERVER';
      }

      apiErrorService.showError(message);

      return throwError(() => error);
    }),
  );
};
