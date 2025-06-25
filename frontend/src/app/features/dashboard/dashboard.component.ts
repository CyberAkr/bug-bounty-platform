import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '@app/core/auth/auth.service';
import { UserResponse } from '@app/models/user.model';

// Composants chercheurs
import { researcherWelcomeComponent } from './researcher/welcome/researcher-welcome.component';
import { researcherTrainingComponent } from './researcher/training/researcher-training.component';
import { reportGuideComponent } from './researcher/report-guide/report-guide.component';
import { bountyExampleComponent } from './researcher/bounty-example/bounty-example.component';
import { researcherThanksComponent } from './researcher/thanks/researcher-thanks.component';

// Composants entreprise
import { CompanyWelcomeComponent } from './company/company-welcome/company-welcome.component';
import { VerificationFormComponent } from './company/verification-form/verification-form.component';
import { VerificationStatusBannerComponent } from './company/verification-status-banner/verification-status-banner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    // Chercheur
    researcherWelcomeComponent,
    researcherTrainingComponent,
    reportGuideComponent,
    bountyExampleComponent,
    researcherThanksComponent,
    // Entreprise
    CompanyWelcomeComponent,
    VerificationFormComponent,
    VerificationStatusBannerComponent
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  user = signal<UserResponse | null>(null);

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: u => this.user.set(u)
    });
  }

  getVerifiedStatus(): 'PENDING' | 'REJECTED' | 'APPROVED' {
    return (this.user()?.verificationStatus ?? 'PENDING') as 'PENDING' | 'REJECTED' | 'APPROVED';
  }
}
