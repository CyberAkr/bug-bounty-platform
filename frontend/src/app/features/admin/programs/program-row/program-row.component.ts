import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Program, ProgramStatus, ProgramUpdate } from '../programs.service';

@Component({
  selector: 'tr[app-program-row]',
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: { class: 'border-b last:border-0 hover:bg-gray-50' },
  template: `
    <!-- Titre -->
    <td class="px-4 py-2 align-top">
      @if (edit) {
        <input [(ngModel)]="title" class="border rounded p-1 text-sm w-full" />
      } @else {
        <div class="font-medium">{{ program.title }}</div>
      }
      <div class="text-xs text-gray-500">{{ program.program_id }}</div>
    </td>

    <!-- Description -->
    <td class="px-4 py-2 align-top">
      @if (edit) {
        <textarea [(ngModel)]="description" class="border rounded p-1 text-sm w-full"></textarea>
      } @else {
        <div class="text-sm text-gray-700">{{ program.description }}</div>
      }
    </td>

    <!-- Entreprise -->
    <td class="px-4 py-2 align-top">
      {{ program.company.name }}
    </td>

    <!-- Statut -->
    <td class="px-4 py-2 align-top">
      @if (edit) {
        <select [(ngModel)]="status" class="border rounded p-1 text-sm">
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
      } @else {
        <span class="px-2 py-1 text-xs rounded"
              [class.bg-green-200]="program.status === 'APPROVED'"
              [class.bg-yellow-200]="program.status === 'PENDING'"
              [class.bg-gray-200]="program.status === 'ARCHIVED'">
          {{ program.status }}
        </span>
      }
    </td>

    <!-- Actions -->
    <td class="px-4 py-2 align-top">
      <div class="flex flex-wrap gap-2">
        @if (!edit) {
          <button (click)="toggleEdit()" class="bg-slate-600 hover:bg-slate-700 text-white px-2 py-1 rounded text-sm">✏️ Éditer</button>
          <button *ngIf="program.status === 'PENDING'"
                  (click)="approve.emit({ id: program.program_id })"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm">✅ Approuver</button>
          <button (click)="removed.emit(program.program_id)"
                  class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm">🗑️ Supprimer</button>
        } @else {
          <button (click)="save()"
                  class="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-sm">💾 Enregistrer</button>
          <button (click)="toggleEdit()"
                  class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-2 py-1 rounded text-sm">↩️ Annuler</button>
        }
      </div>
    </td>
  `,
})
export class ProgramRowComponent {
  @Input() program!: Program;
  @Output() approve = new EventEmitter<{ id: number }>();
  @Output() update  = new EventEmitter<{ id: number; dto: ProgramUpdate }>();
  @Output() removed = new EventEmitter<number>();

  edit = false;
  title = '';
  description = '';
  status: ProgramStatus = 'PENDING';

  ngOnInit() {
    this.resetLocal();
  }

  toggleEdit() {
    this.edit = !this.edit;
    if (this.edit) this.resetLocal();
  }

  save() {
    const dto: ProgramUpdate = {};
    if (this.title !== this.program.title) dto.title = this.title;
    if (this.description !== this.program.description) dto.description = this.description;
    if (this.status !== this.program.status) dto.status = this.status;
    if (Object.keys(dto).length === 0) { this.edit = false; return; }
    this.update.emit({ id: this.program.program_id, dto });
    this.edit = false;
  }

  private resetLocal() {
    this.title = this.program.title;
    this.description = this.program.description;
    this.status = this.program.status;
  }
}
