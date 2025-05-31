import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {UserPublic, UserResponse, UserUpdateRequest} from '@app/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getMe(): Observable<UserResponse> {
    return this.http.get<UserResponse>('/api/user/me');
  }



  delete(): Observable<any> {
    return this.http.delete('/api/user/me');
  }


  updateWithForm(data: FormData) {
    return this.http.put('/api/user/me', data);
  }

  getPublic(id: number): Observable<UserPublic> {
    return this.http.get<UserPublic>(`/api/user/${id}/public`); // ✅ Correct
  }


}
