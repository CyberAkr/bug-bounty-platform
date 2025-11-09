import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

import { RankingService } from './ranking.service';
import { UserService } from '@app/features/users/user.service'; // <-- pour récupérer la bio publique
import { UserRanking, UserPublic } from '@app/models/user.model';
import { forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

type Row = UserRanking & {
  score: number;
  earnings: number;
  paidReports: number;
  lastActive: string;
  profilePhoto: string | null;
  name?: string | null;
  bio?: string | null;
};

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatProgressSpinnerModule, MatIconModule, MatButtonModule],
  templateUrl: './ranking.component.html'
})
export class RankingComponent implements OnInit, OnDestroy {
  private rankingSvc = inject(RankingService);
  private usersSvc   = inject(UserService);

  loading = signal(true);
  expandedId = signal<number | null>(null);

  private _rows = signal<Row[]>([]);
  rows  = computed(() => this._rows());
  users = computed(() => this._rows());

  private disconnect: (() => void) | null = null;

  // petit cache pour éviter de recharger la bio à chaque refresh
  private bioCache = new Map<number, string | null>();

  ngOnInit(): void {
    this.loadAll();

    // SSE live → on ré-enrichit avec les bios (en utilisant le cache)
    this.disconnect = this.rankingSvc.connectStream((list) => {
      this.enrichWithBios(list).subscribe((rows) => this._rows.set(rows));
    });
  }

  ngOnDestroy(): void { if (this.disconnect) this.disconnect(); }

  toggle(userId: number) {
    this.expandedId.set(this.expandedId() === userId ? null : userId);
  }

  private loadAll() {
    this.loading.set(true);
    this.rankingSvc.getTopResearchers(0).pipe(
      switchMap((list) => this.enrichWithBios(list))
    ).subscribe({
      next: (rows) => { this._rows.set(rows); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  /** Enrichit la liste avec la bio/nom/photo via /users/public/{id} (avec cache). */
  private enrichWithBios(list: UserRanking[]) {
    if (!list?.length) return of<Row[]>([]);

    const requests = list.map(u => {
      const cached = this.bioCache.get(u.userId);
      if (cached !== undefined) {
        // on retourne un "UserPublic" minimal combiné au cache
        return of({ userId: u.userId, bio: cached, profilePhoto: (u as any).profilePhoto ?? null, username: u.username } as Partial<UserPublic>);
      }
      return this.usersSvc.getPublic(u.userId).pipe(
        map((pub) => {
          const cleanBio = this.cleanBio(pub?.bio);
          this.bioCache.set(u.userId, cleanBio);
          return { ...pub, bio: cleanBio } as Partial<UserPublic>;
        })
      );
    });

    return forkJoin(requests).pipe(
      map((publics) => list.map((u, i) => {
        const pub = publics[i] || {};
        return this.mapRow(u, pub);
      }))
    );
  }

  private mapRow(u: UserRanking, pub: Partial<UserPublic>): Row {
    const bio = this.cleanBio(
      (pub as any)?.bio ??
      (u as any).bio ??
      null
    );

    // priorité à la photo publique si disponible
    const photo =
      (pub as any)?.profilePhoto ??
      (u as any).profilePhoto ??
      null;

    return {
      ...u,
      score:      (u as any).score ?? u.point ?? 0,
      earnings:   (u as any).earnings ?? 0,
      paidReports:(u as any).paidReports ?? 0,
      lastActive: (u as any).lastActive ?? new Date().toISOString(),
      profilePhoto: photo,
      name: (pub as any)?.firstName && (pub as any)?.lastName
        ? `${(pub as any).firstName} ${(pub as any).lastName}`
        : ((pub as any)?.name ?? null),
      bio
    };
  }

  private cleanBio(b: any): string | null {
    if (typeof b !== 'string') return null;
    const s = b.trim();
    if (!s || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return null;
    return s;
  }

  trackUser = (_: number, u: Row) => u.userId;
}
