import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';

import { ProgramService } from '@app/features/programs/program.service';
import { ReportSubmitComponent } from '@app/features/reports/submit/report-submit/report-submit.component';
import { ReportStatusComponent } from '@app/features/reports/status/report-status.component';
import { StatusColorPipe } from '@app/shared/pipes/status-color.pipe';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule,
    MatProgressSpinnerModule, MatButtonModule, MatIconModule, MatChipsModule,
    ReportSubmitComponent, ReportStatusComponent, StatusColorPipe
  ],
  templateUrl: './program-detail.component.html'
})
export class ProgramDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(ProgramService);
  private sanitizer = inject(DomSanitizer);

  program?: any;
  loading = signal(false);
  error = signal<string | null>(null);
  safeDescription = signal<SafeHtml | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || Number.isNaN(id)) {
      this.error.set('Identifiant de programme invalide.');
      return;
    }

    this.loading.set(true);
    this.svc.getOne(id).subscribe({
      next: (data) => {
        this.program = data;
        this.safeDescription.set(
          this.sanitizer.bypassSecurityTrustHtml(data?.description ?? '')
        );
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error || 'Impossible de charger le programme.');
        this.loading.set(false);
      }
    });
  }

  getId(): number {
    return this.program?.id ?? this.program?.programId;
  }

  publish(): void {
    const pid = this.getId();
    if (!pid) return;
    this.loading.set(true);
    this.error.set(null);

    this.svc.checkout(pid).subscribe({
      next: (res) => {
        if (res?.url) window.location.href = res.url;
        else {
          this.error.set("Pas d'URL de redirection Stripe.");
          this.loading.set(false);
        }
      },
      error: (err) => {
        this.error.set(err?.error || 'Erreur lors de la redirection vers Stripe.');
        this.loading.set(false);
      }
    });
  }
}
