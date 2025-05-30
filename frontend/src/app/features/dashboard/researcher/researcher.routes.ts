import { Routes } from '@angular/router';
import { researcherWelcomeComponent } from './welcome/researcher-welcome.component';
import { researcherTrainingComponent } from './training/researcher-training.component';
import { reportGuideComponent } from './report-guide/report-guide.component';
import { bountyExampleComponent } from './bounty-example/bounty-example.component';
import { researcherThanksComponent } from './thanks/researcher-thanks.component';

export const researcherRoutes: Routes = [
  { path: '', component: researcherWelcomeComponent },
  { path: 'training', component: researcherTrainingComponent },
  { path: 'guide', component: reportGuideComponent },
  { path: 'example', component: bountyExampleComponent },
  { path: 'thanks', component: researcherThanksComponent }
];
