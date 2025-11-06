import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserBadge, UserPublic, UserResponse } from '@app/models/user.model';

export interface UploadPhotoResponse {
  message: string;
  profilePhoto: string; // URL publique renvoyée par le backend
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  // === 👤 Récupère le profil actuel ===
  getMe(): Observable<UserResponse> {
    return this.http.get<UserResponse>('/api/users/me');
  }

  // === ✏️ Met à jour les champs du profil (avec FormData) ===
  updateWithForm(data: FormData): Observable<any> {
    return this.http.put('/api/users/me', data);
  }

  // === 🗑️ Supprime le compte utilisateur ===
  delete(): Observable<any> {
    return this.http.delete('/api/users/me');
  }

  // === 📸 Upload d'une photo de profil ===
  uploadPhoto(photoFile: File): Observable<UploadPhotoResponse> {
    const formData = new FormData();
    formData.append('photo', photoFile); // champ "photo" attendu par ton backend
    return this.http.post<UploadPhotoResponse>('/api/users/me/photo', formData);
  }

  // === 👀 Profil public par ID ===
  getPublic(userId: number): Observable<UserPublic> {
    return this.http.get<UserPublic>(`/api/users/${userId}/public`);
  }

  // === 🏅 Badges du user par ID ===
  getBadges(userId: number): Observable<UserBadge[]> {
    return this.http.get<UserBadge[]>(`/api/users/${userId}/badges`);
  }
}
