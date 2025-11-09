import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-report-status',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatIconModule],
  templateUrl: './report-status.component.html'
})
export class ReportStatusComponent implements OnInit {
  private http = inject(HttpClient);
  @Input() programId!: number;
  submitted = false;

  ngOnInit(): void {
    this.http.get<{ submitted: boolean }>(`/api/reports/submitted`, { params: { programId: String(this.programId) } })
      .subscribe({ next: (res) => this.submitted = !!res.submitted });
  }
}
