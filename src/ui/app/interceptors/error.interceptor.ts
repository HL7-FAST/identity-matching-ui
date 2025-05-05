import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);
  return next(request).pipe(
    catchError(err => {
      if ([401, 403].includes(err.status)) {
        router.navigate(['unauthorized']);
      }
      console.error(err);
      return throwError(() => err);
    })
  );
};
