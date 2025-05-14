import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './ui/app/app.component';
import { config } from './ui/app/app.config.server';

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
