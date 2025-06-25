import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import { tap } from 'rxjs/operators';
import { UserResponse } from '@app/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token = signal<string | null>(null);
  private user = signal<UserResponse | null>(null);

  isLoggedIn = computed(() => !!this.token());

  constructor(private http: HttpClient) {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      this.token.set(savedToken);

      this.getCurrentUser().subscribe({
        next: u => {
          console.log('🔐 Utilisateur restauré :', u);
          this.user.set(u);
        },
        error: err => {
          console.warn('❌ Token invalide ou expiré, logout', err);
          this.logout();
        }
      });
    }
  }


  login(email: string, password: string) {
    return this.http.post<{ token: string }>('/api/auth/signin', { email, password }).pipe(
      tap(response => {
        this.token.set(response.token);
        localStorage.setItem('auth_token', response.token);
        console.log('✅ Token enregistré');
      })
    );
  }

  getCurrentUser() {
    return this.http.get<UserResponse>('/api/user/me').pipe(
      tap(user => this.user.set(user))
    );
  }

  logout() {
    this.token.set(null);
    this.user.set(null);
    localStorage.removeItem('auth_token');
    console.log('🔓 Déconnecté');
  }

  register(data: FormData) {
    return this.http.post('/api/auth/register', data);
  }

  getToken() {
    return this.token();
  }

  getUser() {
    return this.user();
  }
}
