import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

import { ReportsService, Report, ReportStatus } from './report.service';
import { VulnerabilitiesService, VulnerabilityType } from '../vulnerabilities/vulnerabilities.service';
import { ReportRowComponent } from './report-row/report-row.component';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, ReportRowComponent, TranslatePipe],
  templateUrl: './reports.component.html',
})
export class ReportsComponent {
  private reportsSvc = inject(ReportsService);
  private vulnSvc = inject(VulnerabilitiesService);

  loading = signal(false);
  reports = signal<Report[]>([]);
  filter = signal<'' | ReportStatus>('');

  vulns = toSignal(this.vulnSvc.getAll(), { initialValue: [] as VulnerabilityType[] });

  constructor() {
    this.reload();
  }

  track = (_: number, r: Report) => r.report_id;

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
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
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
