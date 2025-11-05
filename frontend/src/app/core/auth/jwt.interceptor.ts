import { HttpInterceptorFn } from '@angular/common/http';

// Interceptor simple : on n'ajoute pas le token sur /api/auth/*
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const isAuthApi = req.url.includes('/api/auth/');
  if (isAuthApi) return next(req);

  const token = localStorage.getItem('auth_token');
  return token ? next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })) : next(req);
};
