import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionStorageService } from '../services/core/session.service';
import { authCodeFlowConfig } from '../config/auth-code-flow.config';
import { environment } from 'src/environments/environment';

/** Check if bypass authentication has been enabled */
@Injectable()
export class AuthBypassInterceptor implements HttpInterceptor {
  private bypassAuthentication: boolean = false;
  constructor(private sessionService: SessionStorageService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //check session varaible for auth bypass
    let bypassEnabled = this.sessionService.getItem(
      environment.authBypassSessionKey
    );
    if (bypassEnabled) {
      this.bypassAuthentication = bypassEnabled === 'enabled' ? true : false;
    } else {
      this.bypassAuthentication = false;
    }

    if (this.bypassAuthentication && environment.baseApiUrl && request.url.startsWith(environment.baseApiUrl)) {
      let headers = request.headers.append('X-Allow-Public-Access', '');
      const requestClone = request.clone({
        headers,
      });
      return next.handle(requestClone);
    } else {
      return next.handle(request);
    }
  }
}
