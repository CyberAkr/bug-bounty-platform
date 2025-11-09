import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  User,
  AdminUserUpdate,
  VerificationStatus,
  UserRole,
} from '../users.service';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'tr[app-user-row]',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './user-row.component.html',
})
export class UserRowComponent {
  @Input() user!: User;

  @Output() update = new EventEmitter<{ id: number; dto: AdminUserUpdate }>();
  @Output() removed = new EventEmitter<number>();
  @Output() downloadDoc = new EventEmitter<number>();

  private pending: AdminUserUpdate = {};

  onRole(role: UserRole)            { this.pending.role = role; }
  onBanned(b: boolean)              { this.pending.banned = b; }
  onVerification(v: VerificationStatus) { this.pending.verificationStatus = v; }

  hasPending(): boolean {
    return Object.keys(this.pending).length > 0;
  }

  emitUpdate() {
    if (!this.user?.user_id || !this.hasPending()) return;
    this.update.emit({ id: this.user.user_id, dto: this.pending });
    this.pending = {};
  }

  download() {
    if (!this.user?.user_id) return;
    this.downloadDoc.emit(this.user.user_id);
  }
}
