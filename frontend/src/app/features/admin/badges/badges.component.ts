import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BadgesService, Badge } from './badges.service';

@Component({
  selector: 'app-badges',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
  ],
  templateUrl: './badges.component.html',
})
export class BadgesComponent {
  private service = inject(BadgesService);
  private snack = inject(MatSnackBar);
  private i18n = inject(TranslateService);

  badges = signal<Badge[]>([]);
  newName = signal<string>('');
  newDesc = signal<string>('');

  displayedColumns: string[] = ['name', 'description', 'actions'];

  constructor() {
    this.load();
  }

  load(): void {
    this.service.getAll().subscribe({
      next: (data) => this.badges.set(data),
      error: () => this.toast('admin.badges.msg.loadError'),
    });
  }

  addBadge(): void {
    const name = this.newName().trim();
    const description = this.newDesc().trim();
    if (!name) return;

    this.service.create({ name, description }).subscribe({
      next: () => {
        this.newName.set('');
        this.newDesc.set('');
        this.load();
        this.toast('admin.badges.msg.created');
      },
      error: () => this.toast('admin.badges.msg.saveError'),
    });
  }

  updateBadge(badge: Badge): void {
    this.service
      .update(badge.badge_id, { name: badge.name, description: badge.description })
      .subscribe({
        next: () => {
          this.toast('admin.badges.msg.updated');
          this.load();
        },
        error: () => this.toast('admin.badges.msg.saveError'),
      });
  }

  deleteBadge(id: number): void {
    this.service.delete(id).subscribe({
      next: () => {
        this.toast('admin.badges.msg.deleted');
        this.load();
      },
      error: () => this.toast('admin.badges.msg.deleteError'),
    });
  }

  private toast(key: string): void {
    const msg = this.i18n.instant(key); // traduit la clé immédiatement
    this.snack.open(msg, undefined, { duration: 2200 });
  }
}
