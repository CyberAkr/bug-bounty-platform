import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

import { ProgramService } from '@app/features/programs/program.service';
import { ReportSubmitComponent } from '@app/features/reports/submit/report-submit/report-submit.component';
import { ReportStatusComponent } from '@app/features/reports/status/report-status.component';
import { StatusColorPipe } from '@app/shared/pipes/status-color.pipe';
import { CleanHtmlPipe } from '@app/shared/pipes/clean-html.pipe'; // <-- NEW

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule,
    MatProgressSpinnerModule, MatChipsModule, MatIconModule, MatButtonModule,
    ReportSubmitComponent, ReportStatusComponent, StatusColorPipe,
    CleanHtmlPipe // <-- NEW
  ],
  templateUrl: './program-detail.component.html'
})
export class ProgramDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private programService = inject(ProgramService);

  program?: any;
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || Number.isNaN(id)) {
      this.error.set('programs.detail.invalidId');
      return;
    }

    this.loading.set(true);
    this.programService.getOne(id).subscribe({
      next: (data) => {
        this.program = data;    // le HTML est nettoyé dans le template via le pipe
        this.loading.set(false);
      },
      error: (err) => {
        const msg =
          (typeof err?.error === 'string' && err.error) ||
          err?.error?.message || 'programs.detail.loadError';
        this.error.set(msg);
        this.loading.set(false);
      }
    });
  }

  getId(): number {
    return this.program?.id ?? this.program?.programId;
  }
}
