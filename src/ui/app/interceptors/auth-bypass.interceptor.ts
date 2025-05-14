import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { SessionStorageService } from '../services/core/session.service';
// import { SettingsService } from '../services/settings.service';

export const authBypassInterceptor: HttpInterceptorFn = (request, next) => {
  // const sessionService = inject(SessionStorageService);
  // const settingsService = inject(SettingsService);

  return next(request);

  // return from(settingsService.currentClient$).pipe(
  //   switchMap((client) => {
  //     if (!client) {
  //       return next(request);
  //     }

  //     return from(
  //       sessionService.getItem(environment.authBypassSessionKey)
  //     ).pipe(
  //       switchMap((bypassEnabled) => {
  //         const bypassAuthentication = bypassEnabled === 'enabled';
  //         if (
  //           bypassAuthentication &&
  //           client.fhirBaseUrl &&
  //           request.url.startsWith(client.fhirBaseUrl)
  //         ) {
  //           let headers = request.headers.append('X-Allow-Public-Access', '');
  //           const requestClone = request.clone({ headers });
  //           return next(requestClone);
  //         } else {
  //           return next(request);
  //         }
  //       })
  //     );
  //   })
  // );
};
