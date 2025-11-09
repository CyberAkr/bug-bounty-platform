import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  UsersService,
  User,
  AdminUserUpdate,
  AdminUserCreate,
} from './users.service';
import { UserRowComponent } from './user-row/user-row.component';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, UserRowComponent, TranslatePipe],
  templateUrl: './users.component.html',
})
export class UsersComponent {
  private service = inject(UsersService);

  users = signal<User[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  newUser = signal<AdminUserCreate>({
    firstName: '', lastName: '', username: '',
    email: '', password: '', role: 'researcher',
    verificationStatus: 'PENDING', banned: false,
  });

  constructor() { this.load(); }

  trackUser = (_: number, u: User) => u.user_id ?? _;

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAllUsers().subscribe({
      next: data => this.users.set(data),
      error: err => this.error.set(err?.error || 'Erreur de chargement'),
      complete: () => this.loading.set(false),
    });
  }

  canCreate() {
    const n = this.newUser();
    const baseOk =
      !!n.firstName && !!n.lastName && !!n.username &&
      !!n.email && !!n.password && !!n.role;
    const companyOk = n.role !== 'company' || !!n.companyNumber;
    return baseOk && companyOk;
  }

  onCreate() {
    this.service.createUser(this.newUser()).subscribe({
      next: () => {
        this.newUser.set({
          firstName: '', lastName: '', username: '',
          email: '', password: '', role: 'researcher',
          verificationStatus: 'PENDING', banned: false,
        });
        this.load();
      },
      error: err => this.error.set(err?.error || 'Échec de la création'),
    });
  }

  onUpdate(ev: { id: number; dto: AdminUserUpdate }) {
    this.service.updateUser(ev.id, ev.dto).subscribe({
      next: () => this.load(),
      error: err => this.error.set(err?.error || 'Échec de la mise à jour'),
    });
  }

  onDelete(id: number) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    this.service.deleteUser(id).subscribe({
      next: () => this.load(),
      error: err => this.error.set(err?.error || 'Échec de la suppression'),
    });
  }

  onDownload(userId: number) {
    this.service.downloadVerification(userId).subscribe({
      next: (blob) => {
        if (!blob || blob.size === 0) return alert('Document introuvable ou vide.');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `verification-${userId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 800);
      },
      error: (err) => {
        if (err?.status === 404) alert('Document introuvable');
        else if (err?.status === 401 || err?.status === 403) alert('Non autorisé');
        else alert('Erreur lors du téléchargement');
      }
    });
  }
}
