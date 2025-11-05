import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserPublic, UserResponse } from '@app/models/user.model';

export interface UploadPhotoResponse {
  message: string;
  profilePhoto: string; // URL publique renvoyée par le backend
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  // === Récupère le profil actuel ===
  getMe(): Observable<UserResponse> {
    return this.http.get<UserResponse>('/api/user/me');
  }

  // === Met à jour les champs du profil (sans photo) ===
  updateWithForm(data: FormData): Observable<any> {
    return this.http.put('/api/user/me', data);
  }

  // === Supprime le compte utilisateur ===
  delete(): Observable<any> {
    return this.http.delete('/api/user/me');
  }

  // === Profil public par ID ===
  getPublic(id: number): Observable<UserPublic> {
    return this.http.get<UserPublic>(`/api/user/${id}/public`);
  }

  // === 📸 Upload d'une photo de profil ===
  uploadPhoto(photoFile: File): Observable<UploadPhotoResponse> {
    const formData = new FormData();
    formData.append('photo', photoFile); // champ "photo" attendu par ton backend

    return this.http.post<UploadPhotoResponse>('/api/user/me/photo', formData);
  }
}
