import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProgramService } from '@app/features/programs/program.service';

@Component({
  selector: 'app-program-return',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './program-return.component.html'
})
export class ProgramReturnComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private programService = inject(ProgramService);

  loading = true;
  success = false;
  error: string | null = null;

  ngOnInit(): void {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (!sessionId) {
      this.error = 'Session Stripe manquante';
      this.loading = false;
      return;
    }

    this.programService.confirmSession(sessionId).subscribe({
      next: (res) => {
        this.success = true;
        this.loading = false;

        // ✅ Redirige vers /programs/:id avec l'ID retourné
        if (res?.id) {
          this.router.navigate(['/programs', res.id]);
        } else {
          this.error = 'ID programme manquant';
        }
      },
      error: (err: any) => {
        this.error = err?.error || 'Erreur de confirmation';
        this.loading = false;
      }
    });
  }
}
