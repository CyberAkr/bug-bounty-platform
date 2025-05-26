
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponse, UserUpdateRequest } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>('/api/users/me');
  }

  updateCurrentUser(data: UserUpdateRequest): Observable<void> {
    return this.http.put<void>('/api/users/me', data);
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>('/api/users/me');
  }
}
