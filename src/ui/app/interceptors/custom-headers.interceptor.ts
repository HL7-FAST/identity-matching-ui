import { CustomHeader } from '@/lib/utils/http';
import { isPlatformBrowser } from '@angular/common';
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';

export function customHeadersInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return next(req);
  }
  
  const customHeaders = localStorage.getItem('custom-headers');
  let reqWithHeader = req.clone();
  if (customHeaders) {
    try {
      const headersObj: Array<CustomHeader> = JSON.parse(customHeaders);
      let headers = req.headers;
      for (const header of headersObj) {
        if (!header.key) {
          continue;
        }
        headers = headers.append(header.key, header.value);
      }
      reqWithHeader = req.clone({ headers });
    } catch (e) {
      // Invalid JSON, proceed without modifying headers
      reqWithHeader = req.clone();
    }
  }
  return next(reqWithHeader);
}