import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User, AdminUserUpdate, VerificationStatus, UserRole } from '../users.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'tr[app-user-row]',
  standalone: true,
  imports: [
    FormsModule
  ],
  template: `
    <td class="px-4 py-2 truncate">{{ user.username }}</td>
    <td class="px-4 py-2 truncate">{{ user.email }}</td>

    <td class="px-4 py-2">
      <select class="border rounded p-1 text-xs"
              [ngModel]="user.role"
              (ngModelChange)="onRole($event)">
        <option value="researcher">researcher</option>
        <option value="company">company</option>
        <option value="admin">admin</option>
      </select>

      <label class="inline-flex items-center gap-1 ml-3 text-xs">
        <input type="checkbox"
               [ngModel]="user.is_banned"
               (ngModelChange)="onBanned($event)"> Banni
      </label>
    </td>

    <td class="px-4 py-2">
      <select class="border rounded p-1 text-xs"
              [ngModel]="user.verification_status"
              (ngModelChange)="onVerification($event)">
        <option value="PENDING">PENDING</option>
        <option value="APPROVED">APPROVED</option>
        <option value="REJECTED">REJECTED</option>
      </select>
    </td>

    <td class="px-4 py-2">
      <span class="text-xs"
            [class.text-emerald-600]="user.hasVerificationDocument"
            [class.text-gray-400]="!user.hasVerificationDocument">
        {{ user.hasVerificationDocument ? 'Disponible' : 'Aucun' }}
      </span>
    </td>

    <td class="px-4 py-2">
      <div class="flex items-center gap-2">
        <button class="border rounded px-2 py-1 text-xs"
                (click)="emitUpdate()">
          Enregistrer
        </button>

        <button class="border rounded px-2 py-1 text-xs text-red-600"
                (click)="removed.emit(user.user_id)">
          Supprimer
        </button>

        <button class="border rounded px-2 py-1 text-xs"
                [disabled]="!user.hasVerificationDocument"
                (click)="download()">
          📄 Télécharger
        </button>
      </div>
    </td>
  `
})
export class UserRowComponent {
  @Input() user!: User;

  @Output() update = new EventEmitter<{ id: number; dto: AdminUserUpdate }>();
  @Output() removed = new EventEmitter<number>();

  // 👇 NOUVEAU: émet un number (l’ID) — c’est cet event que tu captes dans UsersComponent
  @Output() downloadDoc = new EventEmitter<number>();

  private pending: AdminUserUpdate = {};

  onRole(role: UserRole) { this.pending.role = role; }
  onBanned(b: boolean) { this.pending.banned = b; }
  onVerification(v: VerificationStatus) { this.pending.verificationStatus = v; }

  emitUpdate() {
    if (!this.user?.user_id) return;
    this.update.emit({ id: this.user.user_id, dto: this.pending });
    this.pending = {};
  }

  download() {
    if (!this.user?.user_id) return;
    this.downloadDoc.emit(this.user.user_id); // 👈 émet bien un number
  }
}
