import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-verification-status-banner',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './verification-status-banner.component.html'
})
export class VerificationStatusBannerComponent {
  // input signal (Angular 16+) au lieu de @Input classique
  readonly status = input<'PENDING' | 'REJECTED' | 'APPROVED'>('PENDING');
}
