import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, VerificationStatus, UserRole } from '@app/features/admin/users/users.service';

@Component({
  selector: 'app-user-row',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <tr class="border-b">
      <td class="px-4 py-2">
        <input [(ngModel)]="user.username" class="text-sm border p-1 rounded w-full" />
      </td>
      <td class="px-4 py-2">{{ user.email }}</td>
      <td class="px-4 py-2">
        <select [(ngModel)]="user.role" class="border rounded text-sm">
          <option value="admin">Admin</option>
          <option value="researcher">Chercheur</option>
          <option value="company">Entreprise</option>
        </select>
      </td>
      <td class="px-4 py-2">
        <input type="checkbox" [(ngModel)]="user.is_banned" />
      </td>
      <td class="px-4 py-2">
        <select [(ngModel)]="user.verification_status" class="border rounded text-sm">
          <option value="APPROVED">Approuvé</option>
          <option value="REJECTED">Rejeté</option>
          <option value="PENDING">En attente</option>
        </select>
      </td>
      <td class="px-4 py-2 space-x-1">
        <button (click)="update()" class="bg-blue-500 text-white px-2 py-1 rounded text-sm">🖊 Modifier</button>
        <button (click)="remove.emit(user.user_id)" class="bg-red-500 text-white px-2 py-1 rounded text-sm">🗑 Supprimer</button>
      </td>
    </tr>
  `,
})
export class UserRowComponent {
  @Input() user!: User;
  @Output() updateUser = new EventEmitter<{ id: number; update: Partial<User> }>();
  @Output() remove = new EventEmitter<number>();
  update() {
    this.updateUser.emit({
      id: this.user.user_id,
      update: {
        role: this.user.role,
        is_banned: this.user.is_banned,
        verification_status: this.user.verification_status,
        username: this.user.username,
      },
    });
  }
}
