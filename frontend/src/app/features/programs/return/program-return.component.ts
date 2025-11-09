import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ProgramService } from '@app/features/programs/program.service';

@Component({
  selector: 'app-program-return',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule,
    MatProgressSpinnerModule, MatIconModule, MatButtonModule
  ],
  templateUrl: './program-return.component.html'
})
export class ProgramReturnComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(ProgramService);
  private i18n = inject(TranslateService);

  loading = signal(true);
  success = signal(false);
  error   = signal<string | null>(null);

  ngOnInit(): void {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (!sessionId) {
      this.error.set(this.i18n.instant('payments.return.errors.missingSession'));
      this.loading.set(false);
      return;
    }

    this.svc.confirmSession(sessionId).subscribe({
      next: (res) => {
        this.success.set(true);
        this.loading.set(false);

        // Redirection vers le programme publié si l’API renvoie un id
        if (res?.id) {
          this.router.navigate(['/programs', res.id]);
        } else {
          this.error.set(this.i18n.instant('payments.return.errors.missingId'));
        }
      },
      error: (err) => {
        const msg =
          err?.error?.message ||
          err?.error ||
          this.i18n.instant('payments.return.errors.generic');

        this.error.set(msg);
        this.loading.set(false);
      }
    });
  }
}
