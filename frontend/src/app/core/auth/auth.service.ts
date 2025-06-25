import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { tap } from 'rxjs/operators';
import { UserResponse } from '@app/models/user.model';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private token = signal<string | null>(null);
  private role = signal<string | null>(null);

  private decodeToken(token: string): string | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      const payload = JSON.parse(atob(padded));
      return payload.role ?? null;
    } catch {
      return null;
    }
  }

  constructor(private http: HttpClient) {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      this.token.set(savedToken);
      this.role.set(this.decodeToken(savedToken));
    }
  }


  login(email: string, password: string) {
    return this.http.post<{ token: string }>('/api/auth/signin', {email, password}).pipe(
        tap(response => {
          this.token.set(response.token);
          this.role.set(this.decodeToken(response.token));
          localStorage.setItem('auth_token', response.token);
        })
    );
  }

  getToken() {
    return this.token();
  }

  currentRole() {
    return this.role();
  }

  logout() {
    this.token.set(null);
    this.role.set(null);
    localStorage.removeItem('auth_token');
  }

  register(data: FormData) {
    return this.http.post('/api/auth/register', data);
  }


  getCurrentUser() {
    return this.http.get<UserResponse>('/api/user/me');
  }

}
