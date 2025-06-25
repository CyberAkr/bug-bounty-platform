import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();
  const user = auth.getUser();

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  // Si le user est déjà connu : OK
  if (user) {
    return true;
  }

  // Sinon on tente de charger l'utilisateur
  return auth.getCurrentUser().pipe(
    map(() => true),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
