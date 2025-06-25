import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { tap } from 'rxjs/operators';
import { UserResponse } from '@app/models/user.model';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private token = signal<string | null>(null);

  constructor(private http: HttpClient) {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      this.token.set(savedToken);
    }
  }


  login(email: string, password: string) {
    return this.http.post<{ token: string }>('/api/auth/signin', {email, password}).pipe(
      tap(response => {
        this.token.set(response.token);
        localStorage.setItem('auth_token', response.token);
      })
    );
  }

  getToken() {
    return this.token();
  }

  logout() {
    this.token.set(null);
    localStorage.removeItem('auth_token');
  }

  register(data: FormData) {
    return this.http.post('/api/auth/register', data);
  }


  getCurrentUser() {
    return this.http.get<UserResponse>('/api/user/me');
  }

}
