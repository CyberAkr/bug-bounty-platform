// frontend/src/app/features/admin/challenges/challenges-admin.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map} from 'rxjs';

export interface Program {
  programId: number;
  title: string;
}

export interface ChallengeAdminDTO {
  title: string;
  description: string;
  startDate: string;   // ISO
  endDate: string;     // ISO
  theme?: string | null;
  linkToResource?: string | null;
  programId: number;
  badgeId?: number | null;
  winningCode?: string | null; // requis en création, optionnel en update
}

export interface ChallengeView {
  challengeId: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  theme?: string;
  linkToResource?: string;
  program?: Program;
  winner?: { userId: number; email: string };
}

@Injectable({ providedIn: 'root' })
export class ChallengesAdminService {
  private http = inject(HttpClient);

  loading = signal(false);
  error = signal<string | null>(null);

  list() {
    return this.http.get<ChallengeView[]>('/api/admin/challenges');
  }

  create(dto: ChallengeAdminDTO) {
    return this.http.post<ChallengeView>('/api/admin/challenges', dto);
  }

  update(id: number, dto: ChallengeAdminDTO) {
    return this.http.patch<ChallengeView>(`/api/admin/challenges/${id}`, dto);
  }

  remove(id: number) {
    return this.http.delete<void>(`/api/admin/challenges/${id}`);
  }

  listPrograms() {
    return this.http.get<any[]>('/api/admin/programs').pipe(
      map(rows => (rows ?? []).map(r => ({
        programId: r.programId ?? r.id, // <-- ajuste si besoin
        title: r.title
      } as Program)))
    );
  }


  // Optionnel si tu affiches des badges
  listBadges() {
    return this.http.get<{ badgeId: number; name: string }[]>('/api/admin/badges');
  }
}
