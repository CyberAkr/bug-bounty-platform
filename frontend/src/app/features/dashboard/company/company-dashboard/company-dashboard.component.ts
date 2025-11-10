import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { VerificationFormComponent } from '@app/features/dashboard/company/verification-form/verification-form.component';
import { VerificationStatusBannerComponent } from '@app/features/dashboard/company/verification-status-banner/verification-status-banner.component';
import { UserService } from '@app/features/users/user.service';
import { UserResponse } from '@app/models/user.model';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    VerificationStatusBannerComponent,
    VerificationFormComponent,
    TranslatePipe
  ],
  templateUrl: './company-dashboard.component.html'
})
export class CompanyDashboardComponent {
  private userService = inject(UserService);

  verificationStatus = signal<'PENDING' | 'REJECTED' | 'APPROVED'>('PENDING');
  isApproved = computed(() => this.verificationStatus() === 'APPROVED');

  constructor() {
    this.userService.getMe().subscribe((user: UserResponse) => {
      this.verificationStatus.set(user.verificationStatus as any);
    });
  }
}
