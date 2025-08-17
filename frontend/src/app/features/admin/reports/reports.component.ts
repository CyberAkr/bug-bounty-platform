import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReportsService,
  ReportStatus,
  Report as AdminReport
} from '@app/features/admin/reports/report.service';
import {
  VulnerabilitiesService,
  VulnerabilityType
} from '@app/features/admin/vulnerabilities/vulnerabilities.service';
import { ReportRowComponent } from './report-row/report-row.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReportRowComponent],
  template: `
    <div class="mx-auto max-w-7xl p-6 space-y-6">

      <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">Gestion des rapports</h1>
          <p class="text-sm text-gray-500">
            Valide ou refuse les rapports et associe un type de vulnérabilité.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button class="px-3 py-1.5 rounded-full border text-sm"
                  [class.bg-gray-900]="filter() === 'PENDING'"
                  [class.text-white]="filter() === 'PENDING'"
                  (click)="setFilter('PENDING')">En attente</button>
          <button class="px-3 py-1.5 rounded-full border text-sm"
                  [class.bg-gray-900]="filter() === 'APPROVED'"
                  [class.text-white]="filter() === 'APPROVED'"
                  (click)="setFilter('APPROVED')">Validés</button>
          <button class="px-3 py-1.5 rounded-full border text-sm"
                  [class.bg-gray-900]="filter() === 'REJECTED'"
                  [class.text-white]="filter() === 'REJECTED'"
                  (click)="setFilter('REJECTED')">Refusés</button>
          <button class="px-3 py-1.5 rounded-full border text-sm"
                  [class.bg-gray-900]="filter() === 'ALL'"
                  [class.text-white]="filter() === 'ALL'"
                  (click)="setFilter('ALL')">Tous</button>
        </div>
      </header>

      @if (loading()) {
        <!-- Loader -->
        <div class="rounded-xl border p-6 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div class="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-5/6 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      } @else {
        @if (filtered().length) {
          <!-- Table -->
          <div class="rounded-xl border overflow-x-auto">
            <table class="w-full table-fixed text-sm border-collapse">
              <colgroup>
                <col class="w-[28%]" />
                <col class="w-[10%]" />
                <col class="w-[14%]" />
                <col class="w-[14%]" />
                <col class="w-[16%]" />
                <col class="w-[14%]" />
                <col class="w-[14%]" />
              </colgroup>

              <thead class="bg-gray-50">
                <tr class="text-left">
                  <th class="px-4 py-3 font-medium text-gray-600 sticky top-0 bg-gray-50">Titre</th>
                  <th class="px-4 py-3 font-medium text-gray-600 sticky top-0 bg-gray-50">Sévérité</th>
                  <th class="px-4 py-3 font-medium text-gray-600 sticky top-0 bg-gray-50">Chercheur</th>
                  <th class="px-4 py-3 font-medium text-gray-600 sticky top-0 bg-gray-50">Soumis</th>
                  <th class="px-4 py-3 font-medium text-gray-600 sticky top-0 bg-gray-50">Vulnérabilité</th>
                  <th class="px-4 py-3 font-medium text-gray-600 sticky top-0 bg-gray-50">Commentaire</th>
                  <th class="px-4 py-3 font-medium text-gray-600 sticky top-0 bg-gray-50">Actions</th>
                </tr>
              </thead>

              <tbody>
                @for (r of filtered(); track r.report_id ?? $any(r).reportId ?? $index) {
                  <tr app-report-row
                      [report]="r"
                      [vulnerabilities]="vulnerabilities()"
                      (approve)="onApprove($event)"
                      (reject)="onReject($event)"
                      (saveVulnerability)="onSaveVuln($event)">
                  </tr>
                }
              </tbody>


            </table>
          </div>
        } @else {
          <!-- Vide -->
          <div class="rounded-xl border p-10 text-center">
            <div class="text-lg font-medium">Aucun rapport pour ce filtre</div>
            <div class="text-gray-500 text-sm">Essaie un autre statut ci-dessus.</div>
          </div>
        }
      }

      @if (error()) {
        <div class="rounded-xl border border-red-300 bg-red-50 text-red-700 p-4">
          {{ error() }}
        </div>
      }
    </div>
  `,
})
export class ReportsComponent {
  private reportsService = inject(ReportsService);
  private vulnService = inject(VulnerabilitiesService);

  // state
  loading = signal(true);
  error   = signal<string | null>(null);

  reports = signal<AdminReport[]>([]);
  vulnerabilities = signal<VulnerabilityType[]>([]);

  filter = signal<ReportStatus | 'ALL'>('PENDING');

  // derived
  filtered = computed(() => {
    const f = this.filter();
    const list = this.reports();
    return f === 'ALL' ? list : list.filter(r => r.status === f);
  });

  constructor() {
    this.load();
  }

  setFilter(f: ReportStatus | 'ALL') {
    this.filter.set(f);
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);

    // Vulnérabilités (silent)
    this.vulnService.getAll().subscribe({
      next: (v) => this.vulnerabilities.set(v),
      error: () => {},
    });

    // Rapports
    const src =
      this.filter() === 'PENDING'
        ? this.reportsService.getPendingReports()
        : this.reportsService.getAllReports();

    src.subscribe({
      next: (data) =>
        this.reports.set(
          this.filter() === 'ALL' ? data : data.filter(r => r.status === this.filter())
        ),
      error: (err) => this.error.set(err?.error || 'Erreur de chargement'),
      complete: () => this.loading.set(false),
    });
  }

  onApprove({ id, comment }: { id: number; comment: string }) {
    this.reportsService.updateStatus(id, 'APPROVED', comment).subscribe(() => this.load());
  }

  onReject({ id, comment }: { id: number; comment: string }) {
    this.reportsService.updateStatus(id, 'REJECTED', comment).subscribe(() => this.load());
  }

  onSaveVuln({ reportId, vulnerabilityId }: { reportId: number; vulnerabilityId: number }) {
    this.reportsService.updateVulnerability(reportId, vulnerabilityId).subscribe(() => this.load());
  }
}
