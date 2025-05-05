import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './ui/app/app.config';
import { AppComponent } from './ui/app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
