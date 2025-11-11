import { Component, inject, signal, computed, effect } from '@angular/core';
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
import { TranslatePipe } from '@ngx-translate/core';
import { ListControlsComponent } from '@app/shared/components/list-controls/list-controls.component';

type SortKey = 'titleAsc' | 'titleDesc' | 'statusAsc' | 'statusDesc';

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProgramRowComponent,
    TranslatePipe,
    ListControlsComponent
  ],
  templateUrl: './programs.component.html',
})
export class ProgramsComponent {
  private service = inject(ProgramsService);

  // --- Données principales ---
  programs = signal<Program[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // --- Filtrage serveur ---
  filter = signal<'' | ProgramStatus>('');

  // --- Contrôles client (recherche, tri, pagination) ---
  pageIndexSig = signal(0);
  pageSizeSig = signal(10);
  querySig = signal('');
  sortSig = signal<SortKey>('titleAsc');
  totalSig = signal(0);

  pageSizeOptions = [10, 25, 50];

  sortOptions = [
    { value: 'titleAsc', label: 'list.sort.titleAsc' },
    { value: 'titleDesc', label: 'list.sort.titleDesc' },
    { value: 'statusAsc', label: 'list.sort.statusAsc' },
    { value: 'statusDesc', label: 'list.sort.statusDesc' },
  ];

  // --- Création d’un nouveau programme ---
  newProg = signal<ProgramCreate>({ title: '', description: '', companyId: 0 });

  constructor() {
    this.load();

    // ✅ met à jour le total dynamiquement sans casser computed()
    effect(() => {
      this.totalSig.set(this.filtered().length);
    });
  }

  // ------------------ Chargement ------------------
  setFilter(v: '' | ProgramStatus) {
    this.filter.set(v || '');
  }

  load() {
    this.loading.set(true);
    this.error.set(null);

    this.service.getAll(this.filter() || undefined).subscribe({
      next: (data) => {
        this.programs.set(data);
        this.pageIndexSig.set(0);
      },
      error: (err) => this.error.set(err?.error || 'Erreur de chargement'),
      complete: () => this.loading.set(false),
    });
  }

  // ------------------ Tri / Recherche ------------------
  private normalize = (s: string) => (s || '').toLowerCase().normalize('NFKD');

  private sortFn = (a: Program, b: Program) => {
    switch (this.sortSig()) {
      case 'titleAsc':
        return a.title.localeCompare(b.title);
      case 'titleDesc':
        return b.title.localeCompare(a.title);
      case 'statusAsc':
        return a.status.localeCompare(b.status);
      case 'statusDesc':
        return b.status.localeCompare(a.status);
      default:
        return 0;
    }
  };

  private filtered = computed(() => {
    const q = this.normalize(this.querySig());
    const list = this.programs();

    const res = q
      ? list.filter((p) => {
        const hay = `${p.title} ${p.description} ${p.company?.name ?? ''}`;
        return this.normalize(hay).includes(q);
      })
      : list.slice();

    res.sort(this.sortFn);
    return res;
  });

  visiblePrograms = computed(() => {
    const start = this.pageIndexSig() * this.pageSizeSig();
    return this.filtered().slice(start, start + this.pageSizeSig());
  });

  onControlsChange(e: {
    pageIndex: number;
    pageSize: number;
    query: string;
    sort: string;
  }) {
    this.pageIndexSig.set(e.pageIndex);
    this.pageSizeSig.set(e.pageSize);
    this.querySig.set(e.query);
    this.sortSig.set(e.sort as SortKey);
  }

  // ------------------ Création / Édition / Suppression ------------------
  updateNew(partial: Partial<ProgramCreate>) {
    this.newProg.update((prev) => ({ ...prev, ...partial }));
  }

  toNumber(v: any): number {
    const n = typeof v === 'number' ? v : parseInt(v, 10);
    return isNaN(n) ? 0 : n;
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
      error: (err) =>
        this.error.set(err?.error || 'Échec de la création du programme'),
    });
  }

  onApprove(id: number) {
    this.service.updateStatus(id, 'APPROVED').subscribe({
      next: () => this.load(),
      error: (err) =>
        this.error.set(err?.error || 'Échec de la mise à jour du statut'),
    });
  }

  onUpdate(ev: { id: number; dto: ProgramUpdate }) {
    this.service.update(ev.id, ev.dto).subscribe({
      next: () => this.load(),
      error: (err) =>
        this.error.set(err?.error || 'Échec de la mise à jour du programme'),
    });
  }

  onDelete(id: number) {
    if (!confirm('Supprimer ce programme ?')) return;
    this.service.delete(id).subscribe({
      next: () => this.load(),
      error: (err) =>
        this.error.set(err?.error || 'Échec de la suppression du programme'),
    });
  }
}
