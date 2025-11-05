import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { UserResponse } from '@app/models/user.model';

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
  private tokenSig = signal<string | null>(null);

  // Pour le flux de vérification d’e-mail
  emailPendingVerification = signal<string | null>(null);

  constructor(private http: HttpClient) {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) this.tokenSig.set(savedToken);
  }

  // ======== Auth classique ========
  login(email: string, password: string) {
    return this.http.post<{ token: string }>('/api/auth/signin', { email, password }).pipe(
      tap(res => {
        this.tokenSig.set(res.token);
        localStorage.setItem('auth_token', res.token);
      })
    );
  }

  logout() {
    this.tokenSig.set(null);
    localStorage.removeItem('auth_token');
  }

  // ✅ Méthode manquante ajoutée
  getToken(): string | null {
    return this.tokenSig();
  }

  getCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>('/api/user/me');
  }

  // ======== Inscription + vérification d’e-mail ========
  register(payload: RegisterPayload) {
    return this.http.post('/api/auth/register', payload).pipe(
      tap(() => this.emailPendingVerification.set(payload.email))
    );
  }

  verifyEmail(email: string, code: string) {
    return this.http.post<{ status: string; token?: string }>('/api/auth/verify-email', { email, code }).pipe(
      tap(res => {
        if (res.token) {
          this.tokenSig.set(res.token);
          localStorage.setItem('auth_token', res.token);
        }
      })
    );
  }

  resendCode(email: string) {
    return this.http.post<{ status: string }>('/api/auth/resend-code', { email });
  }
}
