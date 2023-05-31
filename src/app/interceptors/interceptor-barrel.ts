/* "Barrel" of Http Interceptors */
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthBypassInterceptor } from './auth-bypass.interceptor';
import { ErrorInterceptor } from './error.interceptor';
import { LoadingInterceptor } from './loader.interceptor';

/** Http interceptor providers in outside-in order */
export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AuthBypassInterceptor, multi: true },  
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
];