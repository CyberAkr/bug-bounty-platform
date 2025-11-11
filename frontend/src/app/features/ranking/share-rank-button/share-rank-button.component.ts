import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-share-rank-button',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, TranslateModule],
  templateUrl: './share-rank-button.component.html'
})
export class ShareRankButtonComponent {
  // Inputs (signaux)
  username = input.required<string>();
  rank = input.required<number>();
  points = input.required<number>();
  /** Optionnel : URL publique spécifique (profil). Sinon fallback = /users/:username */
  publicUrl = input<string>();

  private readonly translate = inject(TranslateService);

  // URL à partager (profil public par défaut)
  readonly baseUrl = computed(() => {
    const explicit = this.publicUrl();
    if (explicit) return explicit;

    const origin = window?.location?.origin ?? '';
    return `${origin}/users/${encodeURIComponent(this.username())}`;
  });

  // Texte pour Web Share
  readonly shareText = computed(() => {
    const title = this.translate.instant('ranking.share.title');
    const text = this.translate.instant('ranking.share.text', {
      username: this.username(),
      rank: this.rank(),
      points: this.points()
    });
    return `${title}\n${text}\n#BugBounty #Cybersecurity`;
  });

  // URL LinkedIn (pas d’API nécessaire)
  linkedinShareUrl = () => {
    const url = encodeURIComponent(this.baseUrl());
    return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
  };

  // Action principale
  share = () => {
    const url = this.baseUrl();
    const text = this.shareText();
    if (navigator?.share) {
      navigator
        .share({ title: document.title, text, url })
        .catch(() => window.open(this.linkedinShareUrl(), '_blank', 'noopener'));
    } else {
      window.open(this.linkedinShareUrl(), '_blank', 'noopener');
    }
  };
}
