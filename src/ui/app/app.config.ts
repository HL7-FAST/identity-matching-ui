import { ApplicationConfig, inject, PLATFORM_ID, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { httpInterceptorFns } from './interceptors/interceptor-barrel';
import { isPlatformBrowser } from '@angular/common';
import { SettingsService } from './services/settings.service';
import { firstValueFrom } from 'rxjs';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideClientHydration(withIncrementalHydration()),
    provideHttpClient(withFetch(), withInterceptors(httpInterceptorFns)),
    provideAppInitializer(async () => {
    
      const platformId = inject(PLATFORM_ID);
      const settingsService = inject(SettingsService);

      // Initialize any existing client if in a browser
      if (isPlatformBrowser(platformId)) {
        const client = await settingsService.loadCurrentClient();
        if (!client) {
          try {
            await settingsService.selectClient('default');
          } catch (e) {
            console.error('Failed to select default client', e);
          }
        }
      }

      // Return a resolved promise for non-browser platforms
      return Promise.resolve();
    })
  ]
};
