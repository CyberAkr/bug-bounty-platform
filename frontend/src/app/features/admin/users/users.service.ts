import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, map, catchError} from 'rxjs';

export type UserRole = 'admin' | 'researcher' | 'company';
export type VerificationStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

export interface User {
  user_id: number;
  username: string;
  email: string;
  role: UserRole;
  is_banned: boolean;
  verification_status?: VerificationStatus;
  hasVerificationDocument?: boolean;           // 👈 NOUVEAU
}

export type AdminUserUpdate = {
  role?: UserRole;
  banned?: boolean;
  verificationStatus?: VerificationStatus;
};

export interface AdminUserCreate {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  verificationStatus?: VerificationStatus;
  banned?: boolean;
  companyNumber?: string;
  verificationDocument?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private baseUrl = '/api/admin/users';

  private toUi = (u: any): User => ({
    user_id: u.user_id ?? u.userId ?? u.id,
    username: u.username ?? '',
    email: u.email ?? '',
    role: (u.role ?? '').toLowerCase() as UserRole,
    is_banned: u.is_banned ?? u.isBanned ?? false,
    verification_status: (u.verification_status ?? u.verificationStatus ?? 'PENDING') as VerificationStatus,
    hasVerificationDocument: !!(u.hasVerificationDocument ??
      u.verificationDocument /* fallback si /users renvoie l'entité */),
  });

  // 👉 utilise le nouvel endpoint "summary" (avec hasVerificationDocument)
  getAllUsers(): Observable<User[]> {
    return this.http.get<any[]>(`${this.baseUrl}/summary`).pipe(
      map(list => list.map(this.toUi)),
      catchError(() =>
        this.http.get<any[]>(this.baseUrl).pipe(
          map(list => list.map(this.toUi))
        )
      )
    );
  }

  updateUser(id: number, update: AdminUserUpdate): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}`, update);
  }

  createUser(dto: AdminUserCreate): Observable<User> {
    return this.http.post<any>(this.baseUrl, dto).pipe(map(this.toUi));
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // 👇 NOUVEAU: téléchargement du PDF (blob)
  downloadVerification(userId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${userId}/verification`, { responseType: 'blob' });
  }
}
