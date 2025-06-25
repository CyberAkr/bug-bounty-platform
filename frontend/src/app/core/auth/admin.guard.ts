import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.getUser();

  if (user) {
    if (user.role?.toLowerCase() === 'admin') {
      return true;
    } else {
      router.navigate(['/']);
      return false;
    }
  }

  // fallback si non chargé
  return auth.getCurrentUser().pipe(
    map(user => {
      if (user.role?.toLowerCase() === 'admin') {
        return true;
      } else {
        router.navigate(['/']);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
