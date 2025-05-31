import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VulnerabilitiesService, VulnerabilityType } from '@app/features/admin/vulnerabilities/vulnerabilities.service';
import {ReportRowComponent} from '@app/features/admin/reports/report-row/report-row.component';
import {
  ReportsService,
  ReportStatus,
  Report as AdminReport
} from '@app/features/admin/reports/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReportRowComponent],
  template: `
    <h1 class="text-2xl font-semibold mb-4">Gestion des rapports</h1>

    <table class="w-full text-sm border bg-white rounded">
      <thead class="bg-gray-100 text-left">
      <tr>
        <th class="px-4 py-2">Titre</th>
        <th class="px-4 py-2">Sévérité</th>
        <th class="px-4 py-2">Chercheur</th>
        <th class="px-4 py-2">Soumis le</th>
        <th class="px-4 py-2">Vulnérabilité</th>
        <th class="px-4 py-2">Commentaire</th>
        <th class="px-4 py-2">Actions</th>
      </tr>
      </thead>
      <tbody>
      <ng-container *ngFor="let report of reports()">
        <app-report-row
          [report]="report"
          [vulnerabilities]="vulnerabilities()"
          (action)="handleAction($event)"
          (updateVulnerability)="updateVuln($event)"
        />
      </ng-container>
      </tbody>
    </table>
  `,
})
export class ReportsComponent {
  private reportsService = inject(ReportsService);
  private vulnService = inject(VulnerabilitiesService);

  reports = signal<AdminReport[]>([]);
  vulnerabilities = signal<VulnerabilityType[]>([]);

  constructor() {
    this.load();
  }

  load() {
    this.reportsService.getPendingReports().subscribe(data => this.reports.set(data));
    this.vulnService.getAll().subscribe(data => this.vulnerabilities.set(data));
  }

  handleAction({ id, status, comment }: { id: number; status: ReportStatus; comment: string }) {
    this.reportsService.updateStatus(id, status, comment).subscribe(() => this.load());
  }

  updateVuln({ reportId, vulnerabilityId }: { reportId: number; vulnerabilityId: number }) {
    this.reportsService.updateVulnerability(reportId, vulnerabilityId).subscribe(() => this.load());
  }
}

