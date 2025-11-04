import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { ProgramService } from '@app/features/programs/program.service';
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
  private sanitizer = inject(DomSanitizer);

  // on évite l'interface rigide pour tolérer { id } ou { programId }
  program?: any;

  loading = signal(false);
  error = signal<string | null>(null);

  // description HTML marquée "safe" pour l'affichage
  safeDescription = signal<SafeHtml | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || Number.isNaN(id)) {
      this.error.set('Identifiant de programme invalide.');
      return;
    }

    this.loading.set(true);
    this.programService.getOne(id).subscribe({
      next: (data) => {
        this.program = data;
        // ✅ on marque le HTML comme sûr (création déjà assainie via DOMPurify côté formulaire)
        this.safeDescription.set(
          this.sanitizer.bypassSecurityTrustHtml(data?.description ?? '')
        );
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error || 'Impossible de charger le programme.');
        this.loading.set(false);
      },
    });
  }

  // récupère l'id quel que soit le nom de champ renvoyé par l'API
  getId(): number {
    return this.program?.id ?? this.program?.programId;
  }

  publish(): void {
    const pid = this.getId();
    if (!pid) return;

    this.loading.set(true);
    this.error.set(null);

    this.programService.checkout(pid).subscribe({
      next: (res) => {
        if (res?.url) {
          window.location.href = res.url;
        } else {
          this.error.set("Pas d'URL de redirection Stripe.");
          this.loading.set(false);
        }
      },
      error: (err) => {
        this.error.set(err?.error || 'Erreur lors de la redirection vers Stripe.');
        this.loading.set(false);
      },
    });
  }
}
