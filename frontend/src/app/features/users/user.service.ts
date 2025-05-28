import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponse, UserUpdateRequest } from '@app/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getMe(): Observable<UserResponse> {
    return this.http.get<UserResponse>('/api/users/me');
  }

  update(data: UserUpdateRequest): Observable<any> {
    return this.http.put('/api/users/me', data);
  }

  delete(): Observable<any> {
    return this.http.delete('/api/users/me');
  }
}
