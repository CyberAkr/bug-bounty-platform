import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '@app/core/auth/auth.service';
import { UserResponse } from '@app/models/user.model';

import { ResearcherWelcomeComponent } from './researcher/welcome/researcher-welcome.component';
import { ResearcherTrainingComponent } from './researcher/training/researcher-training.component';
import { ReportGuideComponent } from './researcher/report-guide/report-guide.component';
import { BountyExampleComponent } from './researcher/bounty-example/bounty-example.component';
import { ResearcherThanksComponent } from './researcher/thanks/researcher-thanks.component';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    TranslatePipe,
    // sous-sections chercheur
    ResearcherWelcomeComponent,
    ResearcherTrainingComponent,
    ReportGuideComponent,
    BountyExampleComponent,
    ResearcherThanksComponent
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);

  readonly user = signal<UserResponse | null>(null);
  readonly isCompany = computed(() => this.user()?.role === 'company');
  readonly isResearcher = computed(() => this.user()?.role === 'researcher');

  constructor() {
    this.authService.getCurrentUser().subscribe({
      next: (u) => this.user.set(u),
      error: () => this.user.set(null)
    });
  }
}
