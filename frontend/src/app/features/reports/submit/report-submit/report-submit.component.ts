import { Component, inject, Input, OnInit, signal } from '@angular/core';
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

  @Input({ required: false }) programId?: number;

  programs = signal<AuditProgramResponse[]>([]);
  selectedProgramId: number | null = null;
  title = '';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  selectedFile: File | null = null;

  ngOnInit(): void {
    if (!this.programId) {
      this.programService.getAll().subscribe((data) => {
        this.programs.set(data);
      });
    } else {
      this.selectedProgramId = this.programId;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  submitReport(): void {
    if (!this.selectedProgramId || !this.title.trim() || !this.selectedFile) return;

    const formData = new FormData();
    formData.append('programId', this.selectedProgramId.toString());
    formData.append('title', this.title);
    formData.append('severity', this.severity);
    formData.append('file', this.selectedFile);

    this.reportService.submitFormData(formData).subscribe(() => {
      alert('✅ Rapport soumis avec succès !');
      this.router.navigate(['/reports/my']);
    });
  }
}
