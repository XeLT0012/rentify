import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app/app/app';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(), // ✅ Required for HttpClient to work
    provideRouter(routes)
  ]
});
