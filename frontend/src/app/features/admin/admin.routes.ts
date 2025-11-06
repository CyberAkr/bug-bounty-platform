import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'reports', pathMatch: 'full' },
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

      // ⬇️ on passe par des sous-routes pour la liste/création/édition
      {
        path: 'badges',
        loadChildren: () =>
          import('./badges/admin-badges.routes').then(m => m.ADMIN_BADGES_ROUTES),
      },

      {
        path: 'vulnerabilities',
        loadComponent: () =>
          import('./vulnerabilities/vulnerabilities.component')
            .then(m => m.VulnerabilitiesComponent),
      },
      {
        path: 'challenges',
        loadChildren: () =>
          import('./challenges/admin-challenges.routes').then(m => m.adminChallengesRoutes)
      }
    ],
  },
];
