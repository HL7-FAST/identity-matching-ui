/* "Barrel" of Http Interceptors */
import { loadingInterceptor } from './loader.interceptor';
import { authBypassInterceptor } from './auth-bypass.interceptor';
import { errorInterceptor } from './error.interceptor';

/** Array of functional HTTP interceptors */
export const httpInterceptorFns = [
  loadingInterceptor,
  authBypassInterceptor,
  errorInterceptor
];