import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '@app/features/reports/report.service';
import { ReportResponse } from '@app/models/report.model';

@Component({
  selector: 'app-my-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-reports.component.html',
})
export class MyReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  reports = signal<ReportResponse[]>([]);

  ngOnInit(): void {
    this.reportService.getMyReports().subscribe((data) => {
      this.reports.set(data);
    });
  }
}
