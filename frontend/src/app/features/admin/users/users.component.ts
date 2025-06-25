
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {UserRowComponent} from '@app/features/admin/users/user-row/user-row.component';
import { FormsModule } from '@angular/forms';
import {User, UsersService, NewUser, UserRole} from '@app/features/admin/users/users.service';
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, UserRowComponent, FormsModule],
  template: `
    <h1 class="text-2xl font-semibold mb-4">Gestion des utilisateurs</h1>
    <div class="flex flex-wrap gap-2 mb-4">
      <input [(ngModel)]="newFirst" placeholder="Prénom" class="border p-2 rounded w-28" />
      <input [(ngModel)]="newLast" placeholder="Nom" class="border p-2 rounded w-28" />
      <input [(ngModel)]="newUsername" placeholder="Username" class="border p-2 rounded w-28" />
      <input [(ngModel)]="newEmail" placeholder="Email" class="border p-2 rounded w-40" />
      <input [(ngModel)]="newPass" type="password" placeholder="Password" class="border p-2 rounded w-36" />
      <select [(ngModel)]="newRole" class="border rounded p-2">
        <option value="researcher">Chercheur</option>
        <option value="company">Entreprise</option>
        <option value="admin">Admin</option>
      </select>
      <button (click)="addUser()" class="bg-green-600 text-white px-4 py-2 rounded">➕ Ajouter</button>
    </div>
    <table class="w-full text-sm border bg-white rounded">
      <thead class="bg-gray-100 text-left">
        <tr>
          <th class="px-4 py-2">Username</th>
          <th class="px-4 py-2">Email</th>
          <th class="px-4 py-2">Rôle</th>
          <th class="px-4 py-2">Banni</th>

          <th class="px-4 py-2">Vérification</th>
          <th class="px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <ng-container *ngFor="let user of users()">
          <app-user-row [user]="user" (updateUser)="update($event)" (remove)="remove($event)" />
        </ng-container>
      </tbody>
    </table>
  `,
})
export class UsersComponent {
  private service = inject(UsersService);
  users = signal<User[]>([]);
  newFirst = '';
  newLast = '';
  newUsername = '';
  newEmail = '';
  newPass = '';
  newRole: UserRole = 'researcher';
  constructor() {
    this.load();
  }

  load() {
    this.service.getAllUsers().subscribe((data) => this.users.set(data));
  }

  addUser() {
    if (!this.newEmail || !this.newPass) return;
    const payload: NewUser = {
      email: this.newEmail,
      password: this.newPass,
      firstName: this.newFirst,
      lastName: this.newLast,
      username: this.newUsername,
      role: this.newRole,
    };
    this.service.createUser(payload).subscribe(() => {
      this.newFirst = this.newLast = this.newUsername = this.newEmail = this.newPass = '';
      this.newRole = 'researcher';
      this.load();
    });
  }

  update(event: { id: number; update: Partial<User> }) {
    this.service.updateUser(event.id, event.update).subscribe(() => this.load());
  }

  remove(id: number) {
    this.service.deleteUser(id).subscribe(() => this.load());
  }
}
