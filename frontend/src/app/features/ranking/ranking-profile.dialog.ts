import { Component, inject, signal, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { UserPublic, UserBadge } from '@app/models/user.model';
import { UserService } from '@app/features/users/user.service';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-ranking-profile-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, NgIf, NgForOf],
  templateUrl: './ranking-profile.dialog.html',
  styles: [`
    .head { display:flex; gap:16px; align-items:center; }
    .avatar-lg { width:72px; height:72px; border-radius:9999px; object-fit:cover; background:#eee; }
    .initials-lg { width:72px; height:72px; border-radius:9999px; display:flex; align-items:center; justify-content:center; font-weight:700; background:#e0e0e0; }
    .badges { display:grid; grid-template-columns: repeat(auto-fill, minmax(64px,1fr)); gap:10px; margin-top:12px;}
    .badge { display:flex; flex-direction:column; align-items:center; gap:6px; text-align:center; }
    .badge img { width:40px; height:40px; object-fit:contain; }
    .bio { white-space:pre-wrap; color:#444; }
  `]
})
export class RankingProfileDialogComponent implements OnInit {
  private userService = inject(UserService);
  user = signal<UserPublic | null>(null);
  badges = signal<UserBadge[]>([]);
  loading = signal(true);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { userId: number }) {}

  ngOnInit(): void {
    const id = this.data.userId;

    forkJoin({
      user: this.userService.getPublic(id),
      badges: this.userService.getBadges(id)
    }).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: ({ user, badges }) => {
        this.user.set(user);
        this.badges.set(badges);
      },
      error: () => {
        // On affiche une fiche minimale plutôt que spinner infini
        this.user.set({
          userId: id,
          username: 'Profil indisponible',
          firstName: '',
          lastName: '',
          preferredLanguage: '',
          bio: null,
          point: 0,
          profilePhoto: null
        } as UserPublic);
        this.badges.set([]);
      }
    });
  }
}
