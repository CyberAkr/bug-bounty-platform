import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { RankingService } from './ranking.service';
import { UserRanking } from '@app/models/user.model';
import { RankingProfileDialogComponent } from './ranking-profile.dialog';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './ranking.component.html',
  styles: [`
    .rank-wrap { max-width: 900px; margin: 0 auto; }
    .row { display: grid; grid-template-columns: 56px 1fr auto; gap: 12px; align-items: center; padding: 8px 0; width:100%; }
    .avatar { width: 40px; height: 40px; border-radius: 9999px; object-fit: cover; background: #eee; }
    .initials { width: 40px; height: 40px; border-radius: 9999px; display:flex; align-items:center; justify-content:center; font-weight:600; background:#e0e0e0; }
    .username { font-weight: 600; display:flex; gap:8px; align-items:center; text-align:left; }
    .rank-badge { font-weight:700; min-width:40px; text-align:right; }
    .skeleton { height:56px; background:linear-gradient(90deg,#eee,#f6f6f6,#eee); animation:pulse 1.2s infinite; border-radius:12px; }
    @keyframes pulse { 0%{background-position:-200px 0} 100%{background-position:200px 0} }
    .actions { display:flex; justify-content:flex-end; margin-bottom:8px; }
  `]
})
export class RankingComponent implements OnInit, OnDestroy {
  private rankingService = inject(RankingService);
  private dialog = inject(MatDialog);

  readonly users = signal<UserRanking[]>([]);
  readonly loading = signal(true);
  private disconnect: (() => void) | null = null;

  // état d’affichage : top10 ou complet
  protected showingAll = signal(false);

  ngOnInit(): void {
    this.loadRanking(); // charge top10 par défaut
    // flux SSE (maj auto des points)
    this.disconnect = this.rankingService.connectStream((list) => {
      if (!this.showingAll()) this.users.set(list);
    });
  }

  ngOnDestroy(): void {
    if (this.disconnect) this.disconnect();
  }

  /** Charge le classement (top10 ou complet) */
  private loadRanking(all = false) {
    this.loading.set(true);
    const limit = all ? 0 : 10;
    this.rankingService.getTopResearchers(limit).subscribe({
      next: (list) => {
        this.users.set(list);
        this.showingAll.set(all);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  /** Bascule top10 / complet */
  toggleView() {
    this.loadRanking(!this.showingAll());
  }

  /** Ouvre la fiche profil dans un dialog */
  openProfile(userId: number) {
    this.dialog.open(RankingProfileDialogComponent, {
      width: '520px',
      data: { userId },
      autoFocus: false
    });
  }

  /** TrackBy pour éviter les rerenders inutiles */
  trackUser = (_: number, u: UserRanking) => u.userId;
}
