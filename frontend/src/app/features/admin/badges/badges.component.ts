
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgesService, Badge } from './badges.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-badges',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="text-2xl font-semibold mb-4">Gestion des badges</h1>

    <div class="flex gap-2 mb-4">
      <input [(ngModel)]="newName" placeholder="Nom" class="border p-2 rounded w-1/3" />
      <input [(ngModel)]="newDesc" placeholder="Description" class="border p-2 rounded w-1/2" />
      <button (click)="addBadge()" class="bg-green-600 text-white px-4 py-2 rounded">➕ Ajouter</button>
    </div>

    <table class="w-full text-sm border bg-white rounded">
      <thead class="bg-gray-100 text-left">
        <tr>
          <th class="px-4 py-2">Nom</th>
          <th class="px-4 py-2">Description</th>
          <th class="px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let badge of badges()" class="border-b">
          <td class="px-4 py-2">
            <input [(ngModel)]="badge.name" class="text-sm border p-1 rounded w-full" />
          </td>
          <td class="px-4 py-2">
            <input [(ngModel)]="badge.description" class="text-sm border p-1 rounded w-full" />
          </td>
          <td class="px-4 py-2 space-x-1">
            <button (click)="updateBadge(badge)"
                    class="bg-blue-500 text-white px-2 py-1 rounded text-sm">🖊 Modifier</button>
            <button (click)="deleteBadge(badge.badge_id)"
                    class="bg-red-500 text-white px-2 py-1 rounded text-sm">🗑 Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
})
export class BadgesComponent {
  private service = inject(BadgesService);
  badges = signal<Badge[]>([]);
  newName = '';
  newDesc = '';

  constructor() {
    this.load();
  }

  load() {
    this.service.getAll().subscribe(data => this.badges.set(data));
  }

  addBadge() {
    if (!this.newName.trim()) return;
    this.service.create({ name: this.newName, description: this.newDesc }).subscribe(() => {
      this.newName = '';
      this.newDesc = '';
      this.load();
    });
  }

  updateBadge(badge: Badge) {
    this.service.update(badge.badge_id, {
      name: badge.name,
      description: badge.description
    }).subscribe(() => this.load());
  }

  deleteBadge(id: number) {
    this.service.delete(id).subscribe(() => this.load());
  }
}
