import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponse, UserUpdateRequest } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getMe(): Observable<UserResponse> {
    return this.http.get<UserResponse>('/api/user/me');
  }

  updateWithForm(data: FormData): Observable<any> {
    return this.http.put('/api/user/me', data);
  }

  delete(): Observable<any> {
    return this.http.delete('/api/user/me');
  }
}
