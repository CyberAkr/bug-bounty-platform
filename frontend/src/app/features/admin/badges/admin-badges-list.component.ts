import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BadgesAdminService } from './badges-admin.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-badges-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  styleUrls: ['./admin-badges-list.component.css'],
  template: `
    <mat-card class="p-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Badges</h2>
        <button mat-raised-button color="primary" (click)="goCreate()">
          <mat-icon>add</mat-icon>&nbsp;Créer un badge
        </button>
      </div>

      <table mat-table [dataSource]="svc.items()" class="w-full">

        <!-- Image miniature -->
        <ng-container matColumnDef="image">
          <th mat-header-cell *matHeaderCellDef>Image</th>
          <td mat-cell *matCellDef="let b">
            <img
              *ngIf="b.imagePath"
              [src]="b.imagePath"
              alt="badge"
              class="badge-icon"
            />
          </td>
        </ng-container>

        <!-- Nom -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Nom</th>
          <td mat-cell *matCellDef="let b">{{ b.name }}</td>
        </ng-container>

        <!-- Description -->
        <ng-container matColumnDef="desc">
          <th mat-header-cell *matHeaderCellDef>Description</th>
          <td mat-cell *matCellDef="let b">{{ b.description }}</td>
        </ng-container>

        <!-- Actions -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let b">
            <button
              mat-icon-button
              color="primary"
              matTooltip="Modifier"
              (click)="goEdit(b.badgeId)"
            >
              <mat-icon>edit</mat-icon>
            </button>

            <button
              mat-icon-button
              color="warn"
              matTooltip="Supprimer"
              (click)="deleteBadge(b.badgeId)"
            >
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row; columns: cols"></tr>
      </table>
    </mat-card>
  `
})
export class AdminBadgesListComponent {
  svc = inject(BadgesAdminService);
  router = inject(Router);
  snack = inject(MatSnackBar);
  cols = ['image', 'name', 'desc', 'actions'];

  constructor() {
    this.svc.list();
  }

  goCreate() {
    this.router.navigate(['/admin', 'badges', 'create']);
  }

  goEdit(id: number) {
    this.router.navigate(['/admin', 'badges', id, 'edit']);
  }

  deleteBadge(id: number) {
    if (confirm('Supprimer ce badge ?')) {
      this.svc.delete(id).subscribe({
        next: () => {
          this.snack.open('Badge supprimé', 'OK', { duration: 2000 });
          this.svc.list();
        },
        error: () => this.snack.open('Erreur suppression', 'OK', { duration: 2500 })
      });
    }
  }
}
