import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { AppComponent } from './ui/app/app.component';
import { config } from './ui/app/app.config.server';

const bootstrap = (context: BootstrapContext) => bootstrapApplication(AppComponent, config, context);

export default bootstrap;
