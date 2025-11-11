import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserRanking } from '@app/models/user.model';

@Injectable({ providedIn: 'root' })
export class RankingService {
  private http = inject(HttpClient);

  /**
   * Backend: GET /api/rankings?page=0&size=50&role=researcher
   */
  getTopResearchers(page = 0, size = 50, role = 'researcher') {
    return this.http.get<UserRanking[]>('/api/rankings', {
      params: { page, size, role } as any
    });
  }

  /**
   * Backend SSE: GET /api/rankings/stream?size=50&role=researcher
   * Émet des events nommés "ranking".
   */
  connectStream(
    onData: (data: UserRanking[]) => void,
    size = 50,
    role = 'researcher'
  ): () => void {
    const url = `/api/rankings/stream?size=${encodeURIComponent(size)}&role=${encodeURIComponent(role)}`;
    const es = new EventSource(url);

    const handler = (evt: MessageEvent) => {
      try {
        onData(JSON.parse(evt.data) as UserRanking[]);
      } catch {
        // ignore parse error
      }
    };

    // event nommé "ranking" côté backend
    es.addEventListener('ranking', handler as EventListener);
    es.onerror = () => { /* laisser le navigateur retenter */ };

    return () => {
      es.removeEventListener('ranking', handler as EventListener);
      es.close();
    };
  }
}
