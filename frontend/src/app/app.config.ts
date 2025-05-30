import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { JwtInterceptor } from './core/auth/jwt.interceptor'; // <-- adapte le chemin

import { routes } from './app.routes';

export const appConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([JwtInterceptor])) // ⬅️ ça active ton interceptor !
  ],
};
