
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
export interface NewUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  bio?: string;
  preferredLanguage?: string;
  role: UserRole;
  companyNumber?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private baseUrl = '/api/admin/users';

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  updateUser(id: number, update: Partial<User>): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}`, update);
  }
  createUser(user: NewUser): Observable<User> {
    return this.http.post<User>(this.baseUrl, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

