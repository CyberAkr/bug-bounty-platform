import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponse, UserUpdateRequest } from '@app/models/user.model';

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


}
