import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User, VerificationStatus } from '@app/features/admin/users/users.service';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-user-row',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- ... -->
    <select [(ngModel)]="selectedStatus" class="border rounded text-sm">
      <option value="APPROVED">Approuvé</option>
      <option value="REJECTED">Rejeté</option>
      <option value="PENDING">En attente</option>
    </select>
    <!-- ... -->
  `,
})
export class UserRowComponent {
  @Input() user!: User;
  @Output() action = new EventEmitter<{ id: number; update: Partial<User> }>();

  selectedStatus: VerificationStatus = 'PENDING'; // ✅ fix ici
}
