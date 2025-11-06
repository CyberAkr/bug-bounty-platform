import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';

export interface BadgeView {
  badgeId: number;
  name: string;
  description?: string;
  imagePath?: string;
}

export interface BadgePayload {
  name: string;
  description?: string;
  imagePath?: string;
}

@Injectable({ providedIn: 'root' })
export class BadgesAdminService {
  private http = inject(HttpClient);
  private base = '/api/admin/badges';

  readonly items = signal<BadgeView[]>([]);
  readonly loading = signal(false);

  list() {
    this.loading.set(true);
    return this.http.get<BadgeView[]>(this.base).pipe(
      tap(list => {
        this.items.set(list ?? []);
        this.loading.set(false);
      })
    ).subscribe({ error: () => this.loading.set(false) });
  }

  // ⬇️ les deux renvoient maintenant Observable<number>
  create(payload: BadgePayload) {
    return this.http.post<{ id: number }>(this.base, payload).pipe(map(r => r.id));
  }

  update(id: number, payload: BadgePayload) {
    return this.http.patch<{ id: number }>(`${this.base}/${id}`, payload).pipe(map(r => r.id));
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  uploadImage(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ imagePath: string }>(`${this.base}/upload`, form);
  }
}
