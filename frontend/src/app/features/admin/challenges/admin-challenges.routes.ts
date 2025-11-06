import { Routes } from '@angular/router';
import { AdminChallengesListComponent } from './admin-challenges-list.component';
import { AdminChallengeFormComponent } from './admin-challenge-form.component';

export const adminChallengesRoutes: Routes = [
  { path: '', component: AdminChallengesListComponent },
  { path: 'create', component: AdminChallengeFormComponent },
  { path: 'edit/:id', component: AdminChallengeFormComponent }
];
