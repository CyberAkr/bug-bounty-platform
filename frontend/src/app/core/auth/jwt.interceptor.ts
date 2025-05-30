import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const JwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    console.log('✅ Token intercepté :', token);

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    console.warn('❌ Aucun token trouvé dans l’interceptor');
  }

  return next(req);
};
