import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VulnerabilitiesService, VulnerabilityType } from './vulnerabilities.service';

@Component({
  selector: 'app-vulnerabilities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="text-2xl font-semibold mb-4">Types de vulnérabilités</h1>

    <div class="flex gap-2 mb-4">
      <input [(ngModel)]="newType" placeholder="Ajouter un type" class="border p-2 rounded w-1/2" />
      <button (click)="addType()" class="bg-green-600 text-white px-4 py-2 rounded" [disabled]="!newType.trim()">➕ Ajouter</button>
    </div>

    <div *ngIf="error()" class="rounded border border-red-300 bg-red-50 text-red-700 p-3 mb-3">{{ error() }}</div>

    <table class="w-full text-sm border bg-white rounded">
      <thead class="bg-gray-100 text-left">
      <tr>
        <th class="px-4 py-2">Nom</th>
        <th class="px-4 py-2">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr *ngFor="let vuln of types()" class="border-b">
        <td class="px-4 py-2">
          <input [(ngModel)]="vuln.name" class="text-sm border p-1 rounded w-full" />
        </td>
        <td class="px-4 py-2 space-x-1">
          <button (click)="updateType(vuln)"
                  class="bg-blue-600 text-white px-2 py-1 rounded text-sm"
                  [disabled]="!vuln.name.trim()"
          >💾 Modifier</button>
          <button (click)="deleteType(vuln.type_id)"
                  class="bg-red-500 text-white px-2 py-1 rounded text-sm">🗑 Supprimer</button>
        </td>
      </tr>
      </tbody>
    </table>
  `,
})
export class VulnerabilitiesComponent {
  private service = inject(VulnerabilitiesService);
  types = signal<VulnerabilityType[]>([]);
  newType = '';
  error = signal<string | null>(null);

  constructor() { this.load(); }

  load() {
    this.error.set(null);
    this.service.getAll().subscribe({
      next: data => this.types.set(data),
      error: err => this.error.set(err?.error || 'Erreur de chargement')
    });
  }

  addType() {
    const name = this.newType.trim();
    if (!name) return;
    this.error.set(null);
    this.service.create(name).subscribe({
      next: () => { this.newType = ''; this.load(); },
      error: err => this.error.set(err?.error || 'Échec de la création')
    });
  }

  updateType(vuln: VulnerabilityType) {
    const name = vuln.name?.trim() || '';
    if (!name) return;
    this.error.set(null);
    this.service.update(vuln.type_id, name).subscribe({
      next: updated => {
        // petit refresh local sans recharger toute la liste
        this.types.update(list => list.map(v => v.type_id === updated.type_id ? updated : v));
      },
      error: err => this.error.set(err?.error || 'Échec de la mise à jour')
    });
  }

  deleteType(id: number) {
    this.error.set(null);
    this.service.delete(id).subscribe({
      next: () => this.types.update(list => list.filter(v => v.type_id !== id)),
      error: err => this.error.set(err?.error || 'Échec de la suppression')
    });
  }
}
