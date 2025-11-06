import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserRanking } from '@app/models/user.model';

@Injectable({ providedIn: 'root' })
export class RankingService {
  private http = inject(HttpClient);

  /** charge les chercheurs (top10 ou tous selon limit=0) */
  getTopResearchers(limit = 10, role = 'researcher') {
    return this.http.get<UserRanking[]>('/api/rankings', { params: { limit, role } as any });
  }

  /** flux SSE pour mise à jour auto du top10 */
  connectStream(onData: (data: UserRanking[]) => void): () => void {
    const es = new EventSource('/api/rankings/stream');
    es.onmessage = (evt) => {
      try {
        const payload = JSON.parse(evt.data) as UserRanking[];
        onData(payload);
      } catch {}
    };
    es.onerror = () => { /* ignore les erreurs SSE */ };
    return () => es.close();
  }
}
