import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { computed } from '@angular/core';

export interface Challenge {
  challengeId: number;
  title: string;
  description?: string;
  theme?: string;
  linkToResource?: string;
  startDate: string; // ISO string depuis le backend
  endDate: string;   // ISO string
}

@Injectable({ providedIn: 'root' })
export class ChallengesService {
  private http = inject(HttpClient);

  readonly challenges = signal<Challenge[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadActive() {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<Challenge[]>('/api/challenge/active').subscribe({
      next: (list) => {
        this.challenges.set(list ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Aucun défi actif pour l'instant.");
        this.challenges.set([]);
        this.loading.set(false);
      }
    });
  }

  submitFlag(challengeId: number, flag: string) {
    return this.http.post('/api/challenge/submit', { challengeId, flag }, { responseType: 'text' });
  }
}
