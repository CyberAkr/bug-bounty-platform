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
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [CommonModule, FormsModule, ProgramRowComponent, TranslatePipe],
  templateUrl: './programs.component.html',
})
export class ProgramsComponent {
  private service = inject(ProgramsService);

  programs = signal<Program[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  filter = signal<'' | ProgramStatus>('');
  newProg = signal<ProgramCreate>({ title: '', description: '', companyId: 0 });

  constructor() {
    this.load();
  }

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
