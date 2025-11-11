import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { ReportsService, Report, ReportStatus } from './report.service';
import { VulnerabilitiesService, VulnerabilityType } from '../vulnerabilities/vulnerabilities.service';
import { ReportRowComponent } from './report-row/report-row.component';
import { TranslateModule } from '@ngx-translate/core';

// ✅ Barre de filtres réutilisable
import { ListControlsComponent } from '@app/shared/components/list-controls/list-controls.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule }     from '@angular/material/select';
import { MatButtonModule }     from '@angular/material/button';

/* ---------------------------------------------------------
   Helpers pour compatibilité de champs dynamiques
--------------------------------------------------------- */
function str(v: any): string {
  return (v ?? '').toString();
}
function ts(v: any): number {
  return new Date(v ?? 0).getTime();
}
function pickId(r: any): number {
  return Number(r.report_id ?? r.id ?? r.reportId ?? 0);
}
function pickSubmittedTs(r: any): number {
  return Math.max(
    ts(r.submitted_at ?? r.submittedAt),
    ts(r.created_at ?? r.createdAt),
    ts(r.received_at ?? r.receivedAt),
    0
  );
}
function pickResearcher(r: any): string {
  return str(
    r.researcher_username ??
    r.researcherUsername ??
    r.researcher ??
    r.username ??
    ''
  ).toLowerCase();
}
function pickTitle(r: any): string {
  return str(r.title ?? r.report_title ?? r.name ?? r.report ?? '').toLowerCase();
}
function pickVuln(r: any): string {
  return str(r.vulnerability_name ?? r.vulnerabilityName ?? r.vulnerability ?? '').toLowerCase();
}

/* ---------------------------------------------------------
   Composant principal
--------------------------------------------------------- */
type SortValue =
  | 'submittedDesc' | 'submittedAsc'
  | 'statusAsc'
  | 'researcherAsc' | 'researcherDesc'
  | 'idDesc' | 'idAsc';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReportRowComponent,
    TranslateModule,
    // Barre de filtres + UI
    ListControlsComponent,
    MatFormFieldModule, MatSelectModule, MatButtonModule
  ],
  templateUrl: './reports.component.html'
})
export class ReportsComponent {
  private reportsSvc = inject(ReportsService);
  private vulnSvc = inject(VulnerabilitiesService);

  // --- Signaux d’état
  loading = signal(false);
  private allReports = signal<Report[]>([]);

  // --- Contrôles (barre)
  querySig     = signal<string>('');
  sortSig      = signal<SortValue>('submittedDesc');
  pageIndexSig = signal<number>(0);
  pageSizeSig  = signal<number>(10);
  statusSig    = signal<'' | ReportStatus>(''); // filtre statut

  // --- Options
  pageSizeOptions = [10, 25, 50];
  sortOptions = [
    { value: 'submittedDesc', label: 'ranking.sort.recentActive' },
    { value: 'submittedAsc',  label: 'ranking.sort.oldActive' },
    { value: 'idDesc',        label: 'list.sort.createdDesc' },
    { value: 'idAsc',         label: 'list.sort.createdAsc' },
    { value: 'researcherAsc', label: 'ranking.sort.nameAsc' },
    { value: 'researcherDesc',label: 'ranking.sort.nameDesc' },
    { value: 'statusAsc',     label: 'common.status' }
  ];

  // --- Vulnérabilités
  vulns = toSignal(this.vulnSvc.getAll(), { initialValue: [] as VulnerabilityType[] });

  // --- Calculs
  totalSig = computed(() => this.filteredSortedRows().length);
  pageRows = computed<Report[]>(() => {
    const start = this.pageIndexSig() * this.pageSizeSig();
    return this.filteredSortedRows().slice(start, start + this.pageSizeSig());
  });

  constructor() {
    this.reload();
  }

  /* ---------------------------------------------------------
     Fetch principal
  --------------------------------------------------------- */
  reload() {
    this.loading.set(true);
    this.reportsSvc.getAllReports().subscribe({
      next: (list) => {
        this.allReports.set(list ?? []);
        this.pageIndexSig.set(0);
        this.loading.set(false);
      },
      error: () => {
        this.allReports.set([]);
        this.loading.set(false);
      }
    });
  }

  /* ---------------------------------------------------------
     Gestion des filtres / tri / pagination
  --------------------------------------------------------- */
  onControlsChange(e: { pageIndex: number; pageSize: number; query: string; sort: string }) {
    this.pageIndexSig.set(e.pageIndex);
    this.pageSizeSig.set(e.pageSize);
    this.querySig.set(e.query);
    this.sortSig.set((e.sort as SortValue) || 'submittedDesc');
  }

  onStatus(v: '' | ReportStatus) {
    this.statusSig.set(v ?? '');
    this.pageIndexSig.set(0);
  }

  /* ---------------------------------------------------------
     Table actions
  --------------------------------------------------------- */
  track = (_: number, r: Report) => pickId(r);

  onPreview(reportId: number) {
    this.reportsSvc.previewReport(reportId).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      }
    });
  }

  onApprove(id: number, comment: string) {
    this.reportsSvc.updateStatus(id, 'APPROVED', comment).subscribe(() => this.reload());
  }

  onReject(id: number, comment: string) {
    this.reportsSvc.updateStatus(id, 'REJECTED', comment).subscribe(() => this.reload());
  }

  onSaveVuln(reportId: number, vulnerabilityId: number) {
    this.reportsSvc.updateVulnerability(reportId, vulnerabilityId).subscribe();
  }

  /* ---------------------------------------------------------
     Recherche + filtre + tri
  --------------------------------------------------------- */
  private filteredSortedRows(): Report[] {
    const q = this.querySig().toLowerCase().trim();
    const status = this.statusSig();
    let rows = this.allReports();

    // Filtre statut
    if (status) rows = rows.filter((r: any) => r.status === status);

    // Recherche
    if (q) {
      rows = rows.filter((r: any) => {
        const id = str(pickId(r)).toLowerCase();
        return (
          id.includes(q) ||
          pickResearcher(r).includes(q) ||
          pickTitle(r).includes(q) ||
          pickVuln(r).includes(q)
        );
      });
    }

    // Tri
    const sort = this.sortSig();
    rows = [...rows].sort((a: any, b: any) => {
      const dA = pickSubmittedTs(a);
      const dB = pickSubmittedTs(b);
      const nA = pickResearcher(a);
      const nB = pickResearcher(b);
      const idA = pickId(a);
      const idB = pickId(b);

      switch (sort) {
        case 'submittedAsc':   return dA - dB;
        case 'submittedDesc':  return dB - dA;
        case 'idAsc':          return idA - idB;
        case 'idDesc':         return idB - idA;
        case 'researcherAsc':  return nA.localeCompare(nB);
        case 'researcherDesc': return nB.localeCompare(nA);
        case 'statusAsc':      return str(a.status).localeCompare(str(b.status));
        default:               return dB - dA;
      }
    });

    return rows;
  }
}
