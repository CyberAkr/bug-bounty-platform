import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verification-status-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verification-status-banner.component.html'
})
export class VerificationStatusBannerComponent {
  @Input() status: 'PENDING' | 'REJECTED' | 'APPROVED' = 'PENDING';
}
