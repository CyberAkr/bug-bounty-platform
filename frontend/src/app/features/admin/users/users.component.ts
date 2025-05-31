
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {UserRowComponent} from '@app/features/admin/users/user-row/user-row.component';
import {User, UsersService} from '@app/features/admin/users/users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, UserRowComponent],
  template: `
    <h1 class="text-2xl font-semibold mb-4">Gestion des utilisateurs</h1>
    <table class="w-full text-sm border bg-white rounded">
      <thead class="bg-gray-100 text-left">
        <tr>
          <th class="px-4 py-2">Username</th>
          <th class="px-4 py-2">Email</th>
          <th class="px-4 py-2">Rôle</th>
          <th class="px-4 py-2">Statut</th>
          <th class="px-4 py-2">Vérification</th>
          <th class="px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <ng-container *ngFor="let user of users()">
          <app-user-row [user]="user" (action)="handleAction($event)" />
        </ng-container>
      </tbody>
    </table>
  `,
})
export class UsersComponent {
  private service = inject(UsersService);
  users = signal<User[]>([]);

  constructor() {
    this.load();
  }

  load() {
    this.service.getAllUsers().subscribe((data) => this.users.set(data));
  }

  handleAction(event: { id: number; update: Partial<User> }) {
    this.service.updateUser(event.id, event.update).subscribe(() => this.load());
  }
}
