import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReportsService, Report, ReportStatus } from './report.service';
import { ReportRowComponent } from './report-row/report-row.component';
import { VulnerabilitiesService, VulnerabilityType } from '../vulnerabilities/vulnerabilities.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, ReportRowComponent],
  template: `
    <section class="p-4">
      <header class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-semibold">Rapports</h1>
        <div class="flex items-center gap-2">
          <label class="text-sm">Filtrer :</label>
          <select [ngModel]="filter()" (ngModelChange)="onFilterChange($event)"
                  class="border rounded px-2 py-1 text-sm">
            <option value="">Tous</option>
            <option value="PENDING">En attente</option>
            <option value="APPROVED">Approuvés</option>
            <option value="REJECTED">Refusés</option>
          </select>
        </div>
      </header>

      <div *ngIf="loading()">Chargement…</div>
      <div *ngIf="!loading() && reports().length === 0" class="text-sm text-slate-500">
        Aucun rapport.
      </div>

      <div class="overflow-auto" *ngIf="!loading() && reports().length > 0">
        <table class="min-w-full text-sm">
          <thead>
          <tr class="text-left border-b">
            <th class="px-4 py-2">ID</th>
            <th class="px-4 py-2">Rapport</th>
            <th class="px-4 py-2">Sévérité</th>
            <th class="px-4 py-2">Chercheur</th>
            <th class="px-4 py-2">Soumis</th>
            <th class="px-4 py-2">Type vuln.</th>
            <th class="px-4 py-2">Commentaire admin</th>
            <th class="px-4 py-2">Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr app-report-row
              *ngFor="let r of reports()"
              [report]="r"
              [vulnerabilities]="vulns()"
              (preview)="onPreview($event)"
              (approve)="onApprove($event.id, $event.comment)"
              (reject)="onReject($event.id, $event.comment)"
              (saveVulnerability)="onSaveVuln($event.reportId, $event.vulnerabilityId)">
          </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class ReportsComponent {
  private reportsSvc = inject(ReportsService);
  private vulnSvc = inject(VulnerabilitiesService);

  loading = signal(false);
  reports = signal<Report[]>([]);
  filter = signal<'' | ReportStatus>('');

  // ✅ Conversion propre de l’Observable en signal
  vulns = toSignal(this.vulnSvc.getAll(), { initialValue: [] as VulnerabilityType[] });

  constructor() {
    this.reload();
  }

  onFilterChange(value: '' | ReportStatus) {
    this.filter.set(value);
    this.reload();
  }

  reload() {
    this.loading.set(true);
    const status = this.filter();
    const obs = status
      ? this.reportsSvc.getAllReports().pipe(map(list => list.filter(r => r.status === status)))
      : this.reportsSvc.getAllReports();

    obs.subscribe({
      next: list => {
        this.reports.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPreview(reportId: number) {
    this.reportsSvc.previewReport(reportId).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
      },
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
}
