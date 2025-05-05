import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SessionStorageService } from '../services/core/session.service';
import { environment } from '@/ui/environments/environment';

export const authBypassInterceptor: HttpInterceptorFn = (request, next) => {
  const sessionService = inject(SessionStorageService);
  return from(sessionService.getItem(environment.authBypassSessionKey)).pipe(
    switchMap((bypassEnabled) => {
      const bypassAuthentication = bypassEnabled === 'enabled';
      if (
        bypassAuthentication &&
        environment.baseApiUrl &&
        request.url.startsWith(environment.baseApiUrl)
      ) {
        let headers = request.headers.append('X-Allow-Public-Access', '');
        const requestClone = request.clone({ headers });
        return next(requestClone);
      } else {
        return next(request);
      }
    })
  );
};
