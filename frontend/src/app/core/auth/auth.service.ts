// frontend/src/app/core/auth/auth.service.ts
import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { UserResponse } from '@app/models/user.model';

export type AppRole = 'researcher' | 'company' | 'admin' | undefined;

type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username?: string;
  bio?: string;
  preferredLanguage?: string;
  role: 'company' | 'researcher' | 'admin';
  companyNumber?: string | null;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  // === Etat ===
  private tokenSig = signal<string | null>(localStorage.getItem('auth_token'));
  private meSig    = signal<UserResponse | null>(null);

  // === Sélecteurs réactifs exposés au reste de l'app ===
  readonly isLoggedIn = computed(() => !!this.tokenSig());
  readonly role       = computed<AppRole>(() => (this.meSig()?.role as AppRole) ?? undefined);
  readonly currentUser = computed(() => this.meSig());

  constructor() {
    // Charger /me dès qu'un token est dispo
    effect(() => {
      const token = this.tokenSig();
      if (!token) {
        this.meSig.set(null);
        return;
      }
      // On tente /me ; si 401 on purge le token local
      this.http.get<UserResponse>('/api/users/me').subscribe({
        next: (me) => this.meSig.set(me),
        error: () => this.clearToken()
      });
    });

    // Synchroniser login/logout entre onglets
    window.addEventListener('storage', (ev) => {
      if (ev.key === 'auth_token') {
        this.tokenSig.set(localStorage.getItem('auth_token'));
      }
    });
  }

  // ======== Auth classique ========
  login(email: string, password: string) {
    return this.http.post<{ token: string }>('/api/auth/signin', { email, password }).pipe(
      tap(res => this.setToken(res.token))
    );
  }

  logout() {
    this.clearToken();
  }

  // Utilitaire si tu poses le token après verify-email ou refresh
  setToken(token: string) {
    localStorage.setItem('auth_token', token);
    this.tokenSig.set(token);
  }

  getToken(): string | null {
    return this.tokenSig();
  }

  getCurrentUser(): Observable<UserResponse> {
    // (garde pour usage direct si besoin)
    return this.http.get<UserResponse>('/api/users/me');
  }

  // ======== Inscription + vérification d’e-mail ========
  emailPendingVerification = signal<string | null>(null);

  register(payload: RegisterPayload) {
    return this.http.post('/api/auth/register', payload).pipe(
      tap(() => this.emailPendingVerification.set(payload.email))
    );
  }

  verifyEmail(email: string, code: string) {
    return this.http.post<{ status: string; token?: string }>('/api/auth/verify-email', { email, code }).pipe(
      tap(res => {
        if (res.token) {
          this.setToken(res.token);
        }
      })
    );
  }

  resendCode(email: string) {
    return this.http.post<{ status: string }>('/api/auth/resend-code', { email });
  }

  // === Helpers ===
  private clearToken() {
    localStorage.removeItem('auth_token');
    this.tokenSig.set(null);
  }
}
