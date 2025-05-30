import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '@app/core/auth/auth.service';
import { UserResponse } from '@app/models/user.model';

import { researcherWelcomeComponent } from './researcher/welcome/researcher-welcome.component';
import { researcherTrainingComponent } from './researcher/training/researcher-training.component';
import { reportGuideComponent } from './researcher/report-guide/report-guide.component';
import { bountyExampleComponent } from './researcher/bounty-example/bounty-example.component';
import { researcherThanksComponent } from './researcher/thanks/researcher-thanks.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    // 👇 Ajoute tous tes composants standalone ici
    researcherWelcomeComponent,
    researcherTrainingComponent,
    reportGuideComponent,
    bountyExampleComponent,
    researcherThanksComponent
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  user: UserResponse | null = null;

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (u) => this.user = u
    });
  }
}
