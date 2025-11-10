import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

import { VerificationStatusBannerComponent } from '@app/features/dashboard/company/verification-status-banner/verification-status-banner.component';
import { VerificationFormComponent } from '@app/features/dashboard/company/verification-form/verification-form.component';
import { UserService } from '@app/features/users/user.service';
import { UserResponse } from '@app/models/user.model';

@Component({
  selector: 'app-company-dashboard-intro',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    TranslatePipe,
    VerificationStatusBannerComponent,
    VerificationFormComponent
  ],
  templateUrl: './company-dashboard-intro.component.html'
})
export class CompanyDashboardIntroComponent {
  private readonly userService = inject(UserService);

  readonly verificationStatus = signal<'PENDING' | 'REJECTED' | 'APPROVED'>('PENDING');
  readonly isApproved = computed(() => this.verificationStatus() === 'APPROVED');

  constructor() {
    this.userService.getMe().subscribe((u: UserResponse) => {
      this.verificationStatus.set((u.verificationStatus as any) ?? 'PENDING');
    });
  }
}
