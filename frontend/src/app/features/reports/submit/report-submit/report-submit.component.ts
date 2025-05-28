import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgramService } from '@app/features/programs/program.service';
import { ReportService } from '@app/features/reports/report.service';
import { AuditProgramResponse } from '@app/models/program.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report-submit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-submit.component.html',
})
export class ReportSubmitComponent implements OnInit {
  private programService = inject(ProgramService);
  private reportService = inject(ReportService);
  private router = inject(Router);

  programs = signal<AuditProgramResponse[]>([]);
  selectedProgramId: number | null = null;
  title = '';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

  ngOnInit(): void {
    this.programService.getAll().subscribe((data) => {
      this.programs.set(data);
    });
  }

  submitReport(): void {
    if (!this.selectedProgramId || !this.title.trim()) return;

    this.reportService.submit({
      title: this.title,
      severity: this.severity,
      programId: this.selectedProgramId,
    }).subscribe(() => {
      alert('✅ Rapport soumis !');
      this.router.navigate(['/reports/my']); // rediriger vers mes rapports
    });
  }
}
