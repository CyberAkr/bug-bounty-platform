import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProgramService } from '@app/features/programs/program.service';
import { AuditProgramResponse } from '@app/models/program.model';
import { ReportSubmitComponent } from '@app/features/reports/submit/report-submit/report-submit.component';
import { ReportStatusComponent } from '@app/features/reports/status/report-status.component';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReportSubmitComponent, ReportStatusComponent],
  templateUrl: './program-detail.component.html',
})
export class ProgramDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private programService = inject(ProgramService);

  program?: AuditProgramResponse;

  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.programService.getOne(id).subscribe((data) => {
      this.program = data;
    });
  }

  publish(): void {
    if (!this.program) return;

    this.loading.set(true);
    this.error.set(null);

    this.programService.checkout(this.program.id).subscribe({
      next: (res) => {
        window.location.href = res.url;
      },
      error: (err) => {
        this.error.set(err?.error || 'Erreur lors de la redirection vers Stripe.');
        this.loading.set(false);
      },
    });
  }
}
