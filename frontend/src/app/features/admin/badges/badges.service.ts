
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Badge {
  badge_id: number;
  name: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class BadgesService {
  private http = inject(HttpClient);
  private baseUrl = '/api/badges';

  getAll(): Observable<Badge[]> {
    return this.http.get<Badge[]>(this.baseUrl);
  }

  create(badge: Partial<Badge>): Observable<Badge> {
    return this.http.post<Badge>(this.baseUrl, badge);
  }

  update(id: number, badge: Partial<Badge>): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}`, badge);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

