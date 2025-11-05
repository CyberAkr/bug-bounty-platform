import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserPublic, UserResponse } from '@app/models/user.model';

export interface UploadPhotoResponse {
  message: string;
  profilePhoto: string; // URL publique renvoyée par le backend
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getMe(): Observable<UserResponse> {
    return this.http.get<UserResponse>('/api/user/me');
  }

  updateWithForm(data: FormData): Observable<unknown> {
    return this.http.put('/api/user/me', data);
  }

  // ✅ MÉTHODE MANQUANTE
  uploadPhoto(file: File): Observable<UploadPhotoResponse> {
    const fd = new FormData();
    fd.append('photo', file);
    return this.http.post<UploadPhotoResponse>('/api/user/me/photo', fd);
  }

  delete(): Observable<unknown> {
    return this.http.delete('/api/user/me');
  }

  getPublic(id: number): Observable<UserPublic> {
    return this.http.get<UserPublic>(`/api/user/${id}/public`);
  }
}
