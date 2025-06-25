import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VerificationFormComponent } from '@app/features/dashboard/company/verification-form/verification-form.component';
import { VerificationStatusBannerComponent } from '@app/features/dashboard/company/verification-status-banner/verification-status-banner.component';
import { UserService } from '@app/features/users/user.service';
import { UserResponse } from '@app/models/user.model';

@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    VerificationFormComponent,
    VerificationStatusBannerComponent
  ],
  templateUrl: './company-dashboard.component.html'
})
export class CompanyDashboardComponent implements OnInit {
  private userService = inject(UserService);
  verificationStatus = signal<'PENDING' | 'REJECTED' | 'APPROVED'>('PENDING');

  isApproved = computed(() => this.verificationStatus() === 'APPROVED');

  ngOnInit() {
    this.userService.getMe().subscribe({
      next: (user: UserResponse) => {
        console.log('📥 Utilisateur chargé :', user);
        this.verificationStatus.set(user.verificationStatus as any);
      },
      error: err => {
        console.error('❌ Erreur chargement utilisateur', err);
      }
    });
  }
}
