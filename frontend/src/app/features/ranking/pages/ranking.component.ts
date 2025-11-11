import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

import { RankingService, UserRankDTO } from '../ranking.service';
import { UserService } from '@app/features/users/user.service';
import { UserRanking, UserPublic } from '@app/models/user.model';
import { forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ShareRankButtonComponent } from '@app/features/ranking/share-rank-button/share-rank-button.component';

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
  imports: [
    CommonModule,
    TranslateModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    ShareRankButtonComponent
  ],
  templateUrl: './ranking.component.html'
})
export class RankingComponent implements OnInit, OnDestroy {
  private rankingSvc = inject(RankingService);
  protected usersSvc = inject(UserService);

  // UI
  loading = signal(true);
  expandedId = signal<number | null>(null);

  // liste
  private _rows = signal<Row[]>([]);
  rows  = computed(() => this._rows());
  users = computed(() => this._rows());

  // “moi”
  myUserId   = signal<number | null>(null);
  myUsername = signal<string>('anonymous');
  myPoints   = signal<number>(0);
  myRank     = signal<number>(0);

  private disconnect: (() => void) | null = null;
  private bioCache = new Map<number, string | null>();

  ngOnInit(): void {
    // Essaie d’obtenir l’utilisateur courant via UserService (peu importe l’API)
    const svc: any = this.usersSvc as any;
    const me =
      (typeof svc.me === 'function' && svc.me()) ||
      svc.currentUser ||
      (typeof svc.current === 'function' && svc.current()) ||
      (typeof svc.getCurrent === 'function' && svc.getCurrent()) ||
      null;

    const uid = me?.userId ?? me?.id ?? me?.user?.userId ?? me?.value?.userId ?? null;
    const uname = me?.username ?? me?.user?.username ?? me?.value?.username ?? 'anonymous';
    this.myUserId.set(uid);
    this.myUsername.set(uname);

    this.loadAll();

    // SSE live → met à jour la liste; on ne touche pas à mon rang ici
    this.disconnect = this.rankingSvc.connectStream((list) => {
      this.enrichWithBios(list).subscribe((rows) => this._rows.set(rows));
    }, 50, 'researcher');
  }

  ngOnDestroy(): void { if (this.disconnect) this.disconnect(); }

  // UI
  toggle(userId: number) { this.expandedId.set(this.expandedId() === userId ? null : userId); }
  trackUser = (_: number, u: Row) => u.userId;

  // Chargement
  private loadAll() {
    this.loading.set(true);
    this.rankingSvc.getTopResearchers(0, 50, 'researcher').pipe(
      switchMap((list) => this.enrichWithBios(list))
    ).subscribe({
      next: (rows) => {
        this._rows.set(rows);
        this.loading.set(false);

        // (optionnel) si je suis visible dans la page, prends ces valeurs rapides
        this.refreshMyRankFromRows();

        // puis fais foi avec le backend (id -> username -> email)
        this.fetchMyRankWithFallbacks();
      },
      error: () => { this.loading.set(false); /* pas de fallback top1 */ }
    });
  }

  /** Appelle /rank par id, puis par username, puis par email (depuis le JWT). */
  private fetchMyRankWithFallbacks() {
    const byUsername = () => {
      const uname = this.myUsername();
      if (uname && uname !== 'anonymous') {
        this.rankingSvc.getUserRankByUsername(uname, 'researcher').subscribe({
          next: (dto) => this.setMine(dto),
          error: () => this.byEmail()
        });
      } else {
        this.byEmail();
      }
    };

    const id = this.myUserId();
    if (id != null) {
      this.rankingSvc.getUserRank(id, 'researcher').subscribe({
        next: (dto) => this.setMine(dto),
        error: () => byUsername()
      });
    } else {
      byUsername();
    }
  }

  /** Dernier fallback : /rank?email= à partir du JWT côté navigateur. */
  private byEmail() {
    const email = this.getEmailFromJwt();
    if (!email) return; // on garde ce qu’on a (mais surtout pas le top1)
    this.rankingSvc.getUserRankByEmail(email, 'researcher').subscribe({
      next: (dto) => this.setMine(dto),
      error: () => { /* rien : on n’affiche pas top1 */ }
    });
  }

  /** Décodage minimal du payload JWT pour extraire l’email (sub/email). */
  private getEmailFromJwt(): string | null {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('access_token') ||
      sessionStorage.getItem('token') ||
      null;
    if (!token || token.split('.').length < 3) return null;
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = JSON.parse(decodeURIComponent(escape(atob(base64))));
      return (json?.sub || json?.email || '').toString() || null;
    } catch { return null; }
  }

  private setMine(dto: Partial<UserRankDTO>) {
    if (dto.username) this.myUsername.set(dto.username);
    if (typeof dto.point === 'number') this.myPoints.set(dto.point);
    if (typeof dto.rank === 'number') this.myRank.set(dto.rank);
  }

  /** Si je suis dans rows(), initialise rapidement mon rang/pts depuis la page. */
  private refreshMyRankFromRows() {
    const uname = (this.myUsername() ?? '').toLowerCase();
    const idx = this.rows().findIndex(r => (r.username ?? '').toLowerCase() === uname);
    if (idx >= 0) {
      const row = this.rows()[idx];
      this.myRank.set(idx + 1);
      this.myPoints.set(row.point ?? row.score ?? 0);
    }
  }

  // Enrichissement bios
  private enrichWithBios(list: UserRanking[]) {
    if (!list?.length) return of<Row[]>([]);
    const requests = list.map(u => {
      const cached = this.bioCache.get(u.userId);
      if (cached !== undefined) {
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
      map((publics) => list.map((u, i) => this.mapRow(u, publics[i] || {})))
    );
  }

  private mapRow(u: UserRanking, pub: Partial<UserPublic>): Row {
    const bio = this.cleanBio((pub as any)?.bio ?? (u as any).bio ?? null);
    const photo = (pub as any)?.profilePhoto ?? (u as any).profilePhoto ?? null;
    return {
      ...u,
      score: (u as any).score ?? u.point ?? 0,
      earnings: (u as any).earnings ?? 0,
      paidReports: (u as any).paidReports ?? 0,
      lastActive: (u as any).lastActive ?? new Date().toISOString(),
      profilePhoto: photo,
      name: (pub as any)?.firstName && (pub as any)?.lastName
        ? `${(pub as any).firstName} ${(pub as any).lastName}` : ((pub as any)?.name ?? null),
      bio
    };
  }

  private cleanBio(b: any): string | null {
    if (typeof b !== 'string') return null;
    const s = b.trim();
    if (!s || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return null;
    return s;
  }

  // Exposé optionnel
  myUsernameView = () => this.myUsername();
  myPointsView   = () => this.myPoints();
  myRankView     = () => this.myRank();
}
