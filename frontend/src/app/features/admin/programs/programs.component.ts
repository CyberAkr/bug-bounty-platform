import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Program,
  ProgramsService,
  ProgramStatus,
  ProgramCreate,
  ProgramUpdate
} from './programs.service';
import { ProgramRowComponent } from './program-row/program-row.component';

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [CommonModule, FormsModule, ProgramRowComponent],
  template: `
    <div class="mx-auto max-w-7xl p-6 space-y-6">
      <header class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Programmes</h1>

        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">Filtre statut:</label>
          <!-- ❌ [(ngModel)]="filter()"  →  ✅ [ngModel] + (ngModelChange) -->
          <select class="border rounded p-1 text-sm"
                  [ngModel]="filter()"
                  (ngModelChange)="setFilter($event)">
            <option value="">Tous</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
          <button class="px-3 py-1.5 rounded border text-sm" (click)="load()">Appliquer</button>
        </div>
      </header>

      <!-- Création -->
      <section class="rounded-xl border p-4">
        <h2 class="font-medium mb-3">Créer un programme</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input class="border rounded p-2 text-sm"
                 placeholder="Titre"
                 [ngModel]="newProg().title"
                 (ngModelChange)="updateNew({ title: $event })">

          <input class="border rounded p-2 text-sm sm:col-span-2"
                 placeholder="Description"
                 [ngModel]="newProg().description"
                 (ngModelChange)="updateNew({ description: $event })">

          <input class="border rounded p-2 text-sm"
                 type="number"
                 placeholder="Company ID"
                 [ngModel]="newProg().companyId"
                 (ngModelChange)="updateNew({ companyId: toNumber($event) })">

          <select class="border rounded p-2 text-sm"
                  [ngModel]="newProg().status"
                  (ngModelChange)="updateNew({ status: $event || undefined })">
            <option [ngValue]="undefined">PENDING (défaut)</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
        <div class="mt-3">
          <button (click)="onCreate()"
                  class="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded"
                  [disabled]="!canCreate()">
            ➕ Créer
          </button>
        </div>
      </section>

      @if (loading()) {
        <div class="rounded-xl border p-6 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div class="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      } @else {
        @if (programs().length) {
          <div class="rounded-xl border overflow-x-auto">
            <table class="w-full table-fixed text-sm border-collapse">
              <colgroup>
                <col class="w-[20%]" /><col class="w-[34%]" /><col class="w-[18%]" />
                <col class="w-[14%]" /><col class="w-[14%]" />
              </colgroup>
              <thead class="bg-gray-50">
                <tr class="text-left">
                  <th class="px-4 py-2 font-medium text-gray-600 sticky top-0 bg-gray-50">Titre</th>
                  <th class="px-4 py-2 font-medium text-gray-600 sticky top-0 bg-gray-50">Description</th>
                  <th class="px-4 py-2 font-medium text-gray-600 sticky top-0 bg-gray-50">Entreprise</th>
                  <th class="px-4 py-2 font-medium text-gray-600 sticky top-0 bg-gray-50">Statut</th>
                  <th class="px-4 py-2 font-medium text-gray-600 sticky top-0 bg-gray-50">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (p of programs(); track p.program_id ?? $index) {
                  <tr app-program-row
                      [program]="p"
                      (approve)="onApprove($event.id)"
                      (update)="onUpdate($event)"
                      (removed)="onDelete($event)">
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="rounded-xl border p-10 text-center">
            <div class="text-lg font-medium">Aucun programme</div>
          </div>
        }
      }

      @if (error()) {
        <div class="rounded-xl border border-red-300 bg-red-50 text-red-700 p-4">{{ error() }}</div>
      }
    </div>
  `,
})
export class ProgramsComponent {
  private service = inject(ProgramsService);

  programs = signal<Program[]>([]);
  loading  = signal(true);
  error    = signal<string | null>(null);

  // filtre par statut (signal)
  filter = signal<'' | ProgramStatus>('');

  // état du formulaire (signal objet)
  newProg = signal<ProgramCreate>({ title: '', description: '', companyId: 0 });

  constructor() { this.load(); }

  // helpers de binding (signals-friendly)
  setFilter(v: '' | ProgramStatus) {
    this.filter.set((v ?? '') as '' | ProgramStatus);
  }

  updateNew(partial: Partial<ProgramCreate>) {
    this.newProg.update(prev => ({ ...prev, ...partial }));
  }

  toNumber(v: any): number {
    const n = typeof v === 'number' ? v : parseInt(v, 10);
    return isNaN(n) ? 0 : n;
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAll(this.filter() || undefined).subscribe({
      next: data => this.programs.set(data),
      error: err => this.error.set(err?.error || 'Erreur de chargement'),
      complete: () => this.loading.set(false),
    });
  }

  canCreate() {
    const n = this.newProg();
    return !!(n.title && n.description && n.companyId);
  }

  onCreate() {
    this.service.create(this.newProg()).subscribe({
      next: () => {
        this.newProg.set({ title: '', description: '', companyId: 0 });
        this.load();
      },
      error: err => this.error.set(err?.error || 'Échec de la création'),
    });
  }

  onApprove(id: number) {
    this.service.updateStatus(id, 'APPROVED').subscribe({
      next: () => this.load(),
      error: err => this.error.set(err?.error || 'Échec de la mise à jour du statut'),
    });
  }

  onUpdate(ev: { id: number; dto: ProgramUpdate }) {
    this.service.update(ev.id, ev.dto).subscribe({
      next: () => this.load(),
      error: err => this.error.set(err?.error || 'Échec de la mise à jour'),
    });
  }

  onDelete(id: number) {
    if (!confirm('Supprimer ce programme ?')) return;
    this.service.delete(id).subscribe({
      next: () => this.load(),
      error: err => this.error.set(err?.error || 'Échec de la suppression'),
    });
  }
}
