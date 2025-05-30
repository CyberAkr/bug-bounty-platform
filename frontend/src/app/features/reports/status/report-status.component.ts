import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-report-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-status.component.html', // ✅ lien correct vers HTML
})
export class ReportStatusComponent implements OnInit {
  private http = inject(HttpClient);
  @Input() programId!: number;

  submitted = false;

  ngOnInit(): void {
    this.http
      .get<{ submitted: boolean }>(`/api/reports/submitted?programId=${this.programId}`)
      .subscribe({
        next: res => this.submitted = res.submitted,
        error: err => console.error('❌ Erreur lors de la vérification du rapport :', err)
      });
  }
}
