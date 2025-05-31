
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VulnerabilitiesService, VulnerabilityType } from './vulnerabilities.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-vulnerabilities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="text-2xl font-semibold mb-4">Types de vulnérabilités</h1>

    <div class="flex space-x-2 mb-4">
      <input [(ngModel)]="newType" placeholder="Ajouter un type" class="border p-2 rounded w-1/2" />
      <button (click)="addType()" class="bg-green-600 text-white px-4 py-2 rounded">➕ Ajouter</button>
    </div>

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
                    class="bg-blue-500 text-white px-2 py-1 rounded text-sm">🖊 Modifier</button>
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

  constructor() {
    this.load();
  }

  load() {
    this.service.getAll().subscribe(data => this.types.set(data));
  }

  addType() {
    if (!this.newType.trim()) return;
    this.service.create(this.newType).subscribe(() => {
      this.newType = '';
      this.load();
    });
  }

  updateType(vuln: VulnerabilityType) {
    this.service.update(vuln.type_id, vuln.name).subscribe(() => this.load());
  }

  deleteType(id: number) {
    this.service.delete(id).subscribe(() => this.load());
  }
}
