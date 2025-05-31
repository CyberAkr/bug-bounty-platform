import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserRanking } from '@app/models/user.model';

@Injectable({ providedIn: 'root' })
export class RankingService {
  private http = inject(HttpClient);

  getTopResearchers() {
    return this.http.get<UserRanking[]>('/api/rankings');
  }
}
