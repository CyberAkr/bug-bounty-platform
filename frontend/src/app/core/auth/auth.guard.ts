import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const token = auth.getToken();

    if (!token) {
        console.warn('🚫 Aucun token, redirection vers /login');
        router.navigate(['/login']);
        return false;
    }

    return auth.getCurrentUser().pipe(
        map(user => {
            if (!user) {
                console.warn('❌ Utilisateur non trouvé malgré token');
                router.navigate(['/login']);
                return false;
            }
            console.log('✅ Utilisateur authentifié :', user.email);
            return true;
        }),
        catchError(err => {
            console.error('❌ Erreur authGuard /me :', err);
            router.navigate(['/login']);
            return of(false);
        })
    );
};
