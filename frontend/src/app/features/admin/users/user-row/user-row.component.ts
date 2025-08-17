import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminUserUpdate, User, UserRole, VerificationStatus } from '../users.service';

@Component({
  selector: 'tr[app-user-row]',
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: { class: 'border-b last:border-0 hover:bg-gray-50' },
  template: `
    <!-- Username -->
    <td class="px-4 py-2 align-top">
      <div class="font-medium">{{ user.username || '—' }}</div>
      <div class="text-xs text-gray-500">{{ user.user_id }}</div>
    </td>

    <!-- Email -->
    <td class="px-4 py-2 align-top">
      {{ user.email }}
    </td>

    <!-- Rôle -->
    <td class="px-4 py-2 align-top">
      <select [(ngModel)]="role" class="border rounded p-1 text-sm">
        <option value="researcher">researcher</option>
        <option value="company">company</option>
        <option value="admin">admin</option>
      </select>
    </td>

    <!-- Statut (ban) -->
    <td class="px-4 py-2 align-top">
      <label class="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" [(ngModel)]="banned" />
        Banni
      </label>
    </td>

    <!-- Vérification -->
    <td class="px-4 py-2 align-top">
      <select [(ngModel)]="verification" class="border rounded p-1 text-sm">
        <option value="PENDING">PENDING</option>
        <option value="APPROVED">APPROVED</option>
        <option value="REJECTED">REJECTED</option>
      </select>
    </td>

    <!-- Actions -->
    <td class="px-4 py-2 align-top">
      <div class="flex items-center gap-2">
        <button (click)="save()"
                class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded">
          💾 Enregistrer
        </button>
        <button (click)="remove()"
                class="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded">
          🗑️ Supprimer
        </button>
      </div>
    </td>
  `,
})
export class UserRowComponent {
  @Input() user!: User;
  @Output() update = new EventEmitter<{ id: number; dto: AdminUserUpdate }>();
  @Output() removed = new EventEmitter<number>(); // <- renommé

  role: UserRole = 'researcher';
  banned = false;
  verification: VerificationStatus = 'PENDING';

  ngOnInit() {
    this.role = this.user.role ?? 'researcher';
    this.banned = !!this.user.is_banned;
    this.verification = (this.user.verification_status ?? 'PENDING') as VerificationStatus;
  }

  save() {
    this.update.emit({
      id: this.user.user_id,
      dto: { role: this.role, banned: this.banned, verificationStatus: this.verification },
    });
  }

  remove() {
    this.removed.emit(this.user.user_id);
  }
}
