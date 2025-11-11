import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ReportService } from '@app/features/reports/report.service';
import { ReportResponse } from '@app/models/report.model';
import { DateFormatPipe } from '@app/shared/pipes/date-format.pipe';
import { StatusColorPipe } from '@app/shared/pipes/status-color.pipe';

import { ListControlsComponent } from '@app/shared/components/list-controls/list-controls.component';

type SortKey = 'createdDesc' | 'createdAsc' | 'titleAsc' | 'titleDesc';
type SortOption = { value: string; label: string };

@Component({
  selector: 'app-company-received',
  standalone: true,
  imports: [
    CommonModule, TranslateModule,
    MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule,
    DateFormatPipe, StatusColorPipe,
    ListControlsComponent
  ],
  templateUrl: './company-received.component.html'
})
export class CompanyReceivedReportsComponent {
  private readonly reportsApi = inject(ReportService);

  // API state
  loading = signal(true);
  error = signal<string | null>(null);
  reports = signal<ReportResponse[]>([]);

  // List controls (par défaut 4 par page)
  querySig = signal<string>('');
  sortSig  = signal<SortKey>('createdDesc');
  pageIndexSig = signal<number>(0);
  pageSizeSig  = signal<number>(4);

  // Options d’UI
  readonly pageSizeOptions = [4, 8, 12, 24];
  // ✅ mutable (pas de `as const`)
  sortOptions: SortOption[] = [
    { value: 'createdDesc', label: 'list.sort.createdDesc' },
    { value: 'createdAsc',  label: 'list.sort.createdAsc'  },
    { value: 'titleAsc',    label: 'list.sort.titleAsc'    },
    { value: 'titleDesc',   label: 'list.sort.titleDesc'   }
  ];

  // Dérivés: filtre + tri + total + page
  filteredAndSorted = computed(() => {
    const q = this.querySig().trim().toLowerCase();
    const sort = this.sortSig();
    const base = this.reports();

    const filtered = q
      ? base.filter(r =>
        (r.title?.toLowerCase().includes(q)) ||
        (r.programTitle?.toLowerCase().includes(q)) ||
        (r.researcher?.toLowerCase().includes(q))
      )
      : base;

    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case 'createdAsc':
          return (new Date(a.submittedAt).getTime()) - (new Date(b.submittedAt).getTime());
        case 'titleAsc':
          return (a.title || '').localeCompare(b.title || '');
        case 'titleDesc':
          return (b.title || '').localeCompare(a.title || '');
        case 'createdDesc':
        default:
          return (new Date(b.submittedAt).getTime()) - (new Date(a.submittedAt).getTime());
      }
    });

    return sorted;
  });

  totalSig = computed(() => this.filteredAndSorted().length);

  pagedReports = computed(() => {
    const start = this.pageIndexSig() * this.pageSizeSig();
    return this.filteredAndSorted().slice(start, start + this.pageSizeSig());
  });

  constructor() { this.fetch(); }

  refresh(): void { this.fetch(); }

  private fetch(): void {
    this.loading.set(true);
    this.error.set(null);

    this.reportsApi.getCompanyReceivedReports().subscribe({
      next: (list) => {
        this.reports.set(list ?? []);
        const maxPage = Math.max(0, Math.ceil(this.totalSig() / this.pageSizeSig()) - 1);
        if (this.pageIndexSig() > maxPage) this.pageIndexSig.set(0);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'reports.errors.loadReceived');
        this.reports.set([]);
        this.pageIndexSig.set(0);
        this.loading.set(false);
      }
    });
  }

  onControlsChange(evt: { pageIndex: number; pageSize: number; query: string; sort: string }) {
    this.querySig.set(evt.query ?? '');
    this.sortSig.set((evt.sort as SortKey) || 'createdDesc');
    this.pageSizeSig.set(evt.pageSize || 4);
    this.pageIndexSig.set(evt.pageIndex || 0);
  }

  download(r: ReportResponse): void {
    if (r.status !== 'APPROVED') return;
    this.reportsApi.downloadReport(r.id).subscribe({
      next: (resp) => {
        const blob = resp.body!;
        const dispo = resp.headers.get('content-disposition') || '';
        const match = /filename="?(?<name>[^"]+)"?/.exec(dispo);
        const name = match?.groups?.['name'] || `report-${r.id}.pdf`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'reports.errors.download');
      }
    });
  }

  trackById = (_: number, r: ReportResponse) => r.id ?? `${r.title}-${r.submittedAt}`;
}
