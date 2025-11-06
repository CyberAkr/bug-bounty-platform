import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { ReportService, MyRewardView } from '../report.service';
import { DateFormatPipe } from '@app/shared/pipes/date-format.pipe';
import { ReportResponse } from '@app/models/report.model';

@Component({
  selector: 'app-my-reports',
  standalone: true,
  imports: [CommonModule, DateFormatPipe],
  templateUrl: './my-reports.component.html',
})
export class MyReportsComponent implements OnInit {
  private reportsSvc = inject(ReportService);

  reports = signal<ReportResponse[]>([]);
  rewardsMap = signal<Record<number, MyRewardView | null>>({});
  loading = signal(false);

  ngOnInit(): void {
    this.loading.set(true);
    this.reportsSvc.getMyReports().subscribe({
      next: (list: ReportResponse[]) => {
        this.reports.set(list);
        this.loading.set(false);

        // charger la récompense pour chaque rapport
        list.forEach((r) => {
          this.reportsSvc.getMyRewardForReport(r.id).subscribe((rv) => {
            const map = { ...this.rewardsMap() };
            map[r.id] = rv;
            this.rewardsMap.set(map);
          });
        });
      },
      error: () => this.loading.set(false),
    });
  }

  downloadMine(id: number): void {
    this.reportsSvc.downloadOwnReport(id).subscribe((res: HttpResponse<Blob>) => {
      const blob = res.body as Blob;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }
}
