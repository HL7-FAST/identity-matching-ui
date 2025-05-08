import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {

  const platformId = inject(PLATFORM_ID);
  const snackBar = inject(MatSnackBar);

  return next(request).pipe(
    catchError(err => {
      let errMsg = '';

      if (err instanceof HttpErrorResponse) {
        if (err.error instanceof ProgressEvent) {
          errMsg = `ProgressEvent: ${err.message || 'Unknown error'}`;
        }
        else if (err.error instanceof DOMException) {
          errMsg = `DOMException: ${err.error.message || 'Unknown error'}`;
        }
        else if (typeof err.error === 'string') {
          errMsg = `Error: ${err.status} ${err.error}`;
        }
        else if (err.error instanceof Object) {
          // check if the object is a FHIR OperationOutcome
          if (err.error.resourceType === 'OperationOutcome' && err.error.issue && Array.isArray(err.error.issue)) {
            errMsg = 'OperationOutcome error: ' + (err.error.issue || []).filter((issue: any) => issue.severity === 'error').map((issue: any) => issue.diagnostics).join(', ');
          }
          else {
            errMsg = `Error: ${err.status} ${JSON.stringify(err.error)}`;
          }
        }
      }
      else if (err.error instanceof ErrorEvent) {
        errMsg = `ErrorEvent: ${err.error.message || 'Unknown error'}`;
      }
      else {
        errMsg = `Error: ${err.status} ${err.message}`;
      }

      if (isPlatformBrowser(platformId)) {
        console.error('Error:', err);
        snackBar.open(`${errMsg}`, 'Dismiss', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
      return throwError(() => err);
    })
  );
};
