import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

const API = '/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  // Utilisé par verify-email pour afficher l’email en attente
  emailPendingVerification = signal<string | null>(null);

  // ===== Auth =====
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${API}/auth/signin`, { email, password }).pipe(
      tap((res) => { if (res?.token) this.setToken(res.token); })
    );
  }

  register(payload: any): Observable<any> {
    return this.http.post<any>(`${API}/auth/register`, payload);
  }

  verifyEmail(email: string, code: string): Observable<any> {
    return this.http.post<any>(`${API}/auth/verify-email`, { email, code }).pipe(
      tap((res) => { if (res?.token) this.setToken(res.token); })
    );
  }

  resendCode(email: string): Observable<any> {
    return this.http.post<any>(`${API}/auth/resend-code`, { email });
  }

  getCurrentUser(): Observable<any> {
    const token = this.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.get<any>(`${API}/users/me`, { headers });
  }

  // ===== Password reset (code 6 chiffres) =====
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post<any>(`${API}/auth/request-password-reset`, { email });
  }

  resetPassword(payload: { email: string; code: string; newPassword: string }): Observable<any> {
    return this.http.post<any>(`${API}/auth/reset-password`, payload);
  }

  // ===== Token helpers =====
  setToken(token: string) { try { localStorage.setItem('auth_token', token); } catch {} }
  getToken(): string | null { try { return localStorage.getItem('auth_token'); } catch { return null; } }
  clearToken() { try { localStorage.removeItem('auth_token'); } catch {} }
}
