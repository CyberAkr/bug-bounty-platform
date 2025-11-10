// src/app/features/forum/forum.service.ts
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ForumAuthor = {
  id: number;
  username: string;
  role: 'researcher' | 'company' | 'admin' | string;
  banned: boolean;
  profilePhoto?: string;
};

export type ForumMessage = {
  id: number;
  content: string;
  postedAt: string;
  status: 'ACTIVE' | 'DELETED';
  author: ForumAuthor;
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page index
  size: number;
};

@Injectable({ providedIn: 'root' })
export class ForumService {
  private http = inject(HttpClient);
  private base = '/api';

  loading = signal(false);

  list(page = 0, size = 20): Observable<Page<ForumMessage>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<ForumMessage>>(`${this.base}/forum/messages`, { params });
  }

  create(content: string): Observable<ForumMessage> {
    return this.http.post<ForumMessage>(`${this.base}/forum/messages`, { content });
  }

  // ADMIN
  adminSetStatus(id: number, status: 'ACTIVE' | 'DELETED'): Observable<void> {
    // (corrigé) pas de double /api
    return this.http.patch<void>(`${this.base}/admin/forum/messages/${id}/status?status=${status}`, {});
  }
}
