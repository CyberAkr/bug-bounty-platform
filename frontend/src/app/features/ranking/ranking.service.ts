import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserRanking } from '@app/models/user.model';

export interface UserRankDTO {
  userId: number;
  username: string;
  point: number;
  rank: number;
  profilePhoto: string | null;
}

@Injectable({ providedIn: 'root' })
export class RankingService {
  private http = inject(HttpClient);

  getTopResearchers(page = 0, size = 50, role = 'researcher') {
    return this.http.get<UserRanking[]>('/api/rankings', {
      params: { page, size, role } as any
    });
  }

  // Rang par id
  getUserRank(userId: number, role = 'researcher') {
    return this.http.get<UserRankDTO>('/api/rankings/rank', {
      params: { userId, role } as any
    });
  }
  getUserRankByUsername(username: string, role = 'researcher') {
    return this.http.get<UserRankDTO>('/api/rankings/rank', {
      params: { username, role } as any
    });
  }

  getUserRankByEmail(email: string, role = 'researcher') {
    return this.http.get<UserRankDTO>('/api/rankings/rank', {
      params: { email, role } as any
    });
  }
  connectStream(onData: (data: UserRanking[]) => void, size = 50, role = 'researcher'): () => void {
    const es = new EventSource(`/api/rankings/stream?size=${encodeURIComponent(size)}&role=${encodeURIComponent(role)}`);
    const handler = (evt: MessageEvent) => { try { onData(JSON.parse(evt.data) as UserRanking[]); } catch {} };
    es.addEventListener('ranking', handler as EventListener);
    es.onerror = () => {};
    return () => { es.removeEventListener('ranking', handler as EventListener); es.close(); };
  }
}
