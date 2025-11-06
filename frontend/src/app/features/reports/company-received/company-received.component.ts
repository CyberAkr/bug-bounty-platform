import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReportService } from '@app/features/reports/report.service';
import { ReportResponse } from '@app/models/report.model';
import { DateFormatPipe } from '@app/shared/pipes/date-format.pipe';
import { StatusColorPipe } from '@app/shared/pipes/status-color.pipe';

@Component({
  selector: 'app-company-received',
  standalone: true,
  imports: [CommonModule, DateFormatPipe, StatusColorPipe],
  templateUrl: './company-received.component.html',
  styleUrls: ['./company-received.component.css'],
})

export class CompanyReceivedReportsComponent {
  private readonly reportsApi = inject(ReportService);

  loading = signal(true);
  error = signal<string | null>(null);
  reports = signal<ReportResponse[]>([]);

  constructor() {
    this.fetch();
  }

  refresh(): void {
    this.fetch();
  }

  private fetch(): void {
    this.loading.set(true);
    this.error.set(null);

    this.reportsApi.getCompanyReceivedReports().subscribe({
      next: (list) => {
        this.reports.set(list ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur API /reports/received', err);
        this.error.set(err?.error?.message || 'Erreur lors du chargement des rapports reçus.');
        this.reports.set([]);
        this.loading.set(false);
      },
    });
  }
  download(r: ReportResponse): void {
    if (r.status !== 'APPROVED') return;
    this.reportsApi.downloadReport(r.id).subscribe({
      next: (resp) => {
        const blob = resp.body!;
        // récupère le nom depuis Content-Disposition si présent
        const dispo = resp.headers.get('content-disposition') || '';
        const match = /filename="?(?<name>[^"]+)"?/.exec(dispo);
        const name = match?.groups?.['name'] || `report-${r.id}.pdf`;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Téléchargement impossible.');
      }
    });
  }

  trackById = (_: number, r: ReportResponse) => r.id ?? `${r.title}-${r.submittedAt}`;
}
