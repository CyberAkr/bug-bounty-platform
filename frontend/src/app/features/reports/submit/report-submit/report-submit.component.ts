import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { ProgramService } from '@app/features/programs/program.service';
import { ReportService } from '@app/features/reports/report.service';
import { AuditProgramResponse } from '@app/models/program.model';

@Component({
  selector: 'app-report-submit',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslateModule,
    MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule
  ],
  templateUrl: './report-submit.component.html'
})
export class ReportSubmitComponent implements OnInit {
  private programService = inject(ProgramService);
  private reportService = inject(ReportService);
  private router = inject(Router);

  @Input() programId?: number;

  programs = signal<AuditProgramResponse[]>([]);
  selectedProgramId: number | null = null;
  title = '';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  selectedFile: File | null = null;

  ngOnInit(): void {
    if (!this.programId) {
      this.programService.getAll().subscribe((data) => this.programs.set(data));
    } else {
      this.selectedProgramId = this.programId;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  submitReport(): void {
    if (!this.selectedProgramId || !this.title.trim() || !this.selectedFile) return;

    const formData = new FormData();
    formData.append('programId', String(this.selectedProgramId));
    formData.append('title', this.title);
    formData.append('severity', this.severity);
    formData.append('file', this.selectedFile);

    this.reportService.submitFormData(formData).subscribe({
      next: () => this.router.navigate(['/reports/my']),
      error: () => { /* Optionnel: bulle d’erreur inline si besoin */ }
    });
  }
}
