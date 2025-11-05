import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app/routes';
import { AppComponent } from './app/app/app/app';

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)]
});
