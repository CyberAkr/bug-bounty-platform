import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'reports',
        pathMatch: 'full'
      },
      {
        path: 'reports',
        loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users.component').then(m => m.UsersComponent),
      },
      {
        path: 'programs',
        loadComponent: () => import('./programs/programs.component').then(m => m.ProgramsComponent),
      },
      {
        path: 'rewards',
        loadComponent: () => import('./rewards/rewards.component').then(m => m.RewardsComponent),
      },
      {
        path: 'badges',
        loadComponent: () => import('./badges/badges.component').then(m => m.BadgesComponent),
      },
      {
        path: 'vulnerabilities',
        loadComponent: () => import('./vulnerabilities/vulnerabilities.component').then(m => m.VulnerabilitiesComponent),
      },
      {
        path: 'challenges',
        loadComponent: () => import('./challenges/challenges.component').then(m => m.ChallengesComponent),
      },
    ],
  },
];
