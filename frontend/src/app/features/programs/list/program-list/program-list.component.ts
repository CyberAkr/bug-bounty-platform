import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';

import { ProgramService } from '@app/features/programs/program.service';
import { AuditProgramResponse } from '@app/models/program.model';
import { StatusColorPipe } from '@app/shared/pipes/status-color.pipe';
import { AsPlainTextPipe } from '@app/shared/pipes/as-plain-text.pipe';
import { ListControlsComponent } from '@app/shared/components/list-controls/list-controls.component';

@Component({
  selector: 'app-program-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule,
    MatCardModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule, MatChipsModule,
    StatusColorPipe, AsPlainTextPipe, ListControlsComponent
  ],
  templateUrl: './program-list.component.html'
})
export class ProgramListComponent implements OnInit {
  private svc = inject(ProgramService);

  programs = signal<AuditProgramResponse[]>([]);
  loading  = signal(true);

  pageIndex = signal(0);
  pageSize  = signal(10);
  query     = signal('');
  sort      = signal<'createdDesc' | 'createdAsc' | 'titleAsc' | 'titleDesc'>('createdDesc');

  // détection dynamique des champs date
  private readonly dateKeys = ['createdAt','created','submittedAt','updatedAt','date','created_date','creationDate','timestamp'];
  private getTime = (row: any): number => {
    for (const k of this.dateKeys) {
      const v = row?.[k];
      if (v == null) continue;
      if (typeof v === 'number') return v;
      const t = Date.parse(String(v));
      if (!Number.isNaN(t)) return t;
    }
    return typeof row?.id === 'number' ? row.id : 0; // fallback cohérent
  };
  private getTitle = (row: any): string =>
    String(row?.title ?? row?.name ?? row?.label ?? '').toLowerCase();

  private normalized = (s: unknown) => String(s ?? '').toLowerCase();

  private filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.programs();
    return this.programs().filter((p: any) =>
      [this.normalized(p.title), this.normalized(p.companyName), this.normalized(p.description)]
        .some(v => v.includes(q)));
  });

  private sorted = computed(() => {
    const arr = [...this.filtered()];
    switch (this.sort()) {
      case 'titleAsc':   arr.sort((a,b) => this.getTitle(a).localeCompare(this.getTitle(b))); break;
      case 'titleDesc':  arr.sort((a,b) => this.getTitle(b).localeCompare(this.getTitle(a))); break;
      case 'createdAsc': arr.sort((a,b) => this.getTime(a) - this.getTime(b)); break;
      case 'createdDesc':
      default:           arr.sort((a,b) => this.getTime(b) - this.getTime(a)); break;
    }
    return arr;
  });

  total = computed(() => this.sorted().length);

  visiblePrograms = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.sorted().slice(start, start + this.pageSize());
  });

  ngOnInit(): void { this.fetch(); }

  onControls(e: { pageIndex: number; pageSize: number; query: string; sort: string }) {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.query.set(e.query);
    this.sort.set(e.sort as any);
  }

  private fetch() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (data) => { this.programs.set(data ?? []); this.pageIndex.set(0); this.loading.set(false); },
      error: () => { this.programs.set([]); this.pageIndex.set(0); this.loading.set(false); }
    });
  }

  trackId = (_: number, p: AuditProgramResponse) => p.id;
}
