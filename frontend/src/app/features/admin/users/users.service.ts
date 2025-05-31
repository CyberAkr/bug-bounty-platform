
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type UserRole = 'admin' | 'researcher' | 'company';
export type VerificationStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

export interface User {
  user_id: number;
  username: string;
  email: string;
  role: UserRole;
  is_banned: boolean;
  verification_status?: VerificationStatus;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private baseUrl = '/api/users';

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  updateUser(id: number, update: Partial<User>): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}`, update);
  }
}

