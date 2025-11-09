import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ChallengesAdminService, ChallengeView } from './challenges-admin.service';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-admin-challenges-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatTableModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule, TranslatePipe
  ],
  templateUrl: './admin-challenges-list.component.html'
})
export class AdminChallengesListComponent implements OnInit {
  private svc = inject(ChallengesAdminService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);

  data = signal<ChallengeView[]>([]);
  loading = signal(false);

  displayedColumns = ['title', 'period', 'program', 'winner', 'actions'];

  ngOnInit() {
    this.fetch();
  }

  fetch() {
    this.loading.set(true);
    this.svc.list().subscribe({
      next: (list) => { this.data.set(list ?? []); this.loading.set(false); },
      error: () => { this.loading.set(false); this.snack.open('Erreur chargement des défis', 'OK', { duration: 2500 }); }
    });
  }



  remove(id: number) {
    if (!confirm('Supprimer ce défi ?')) return;
    this.svc.remove(id).subscribe({
      next: () => { this.snack.open('Défi supprimé', 'OK', { duration: 1800 }); this.fetch(); },
      error: () => this.snack.open('Suppression impossible', 'OK', { duration: 2500 })
    });
  }
}
