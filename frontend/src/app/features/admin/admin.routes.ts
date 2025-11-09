import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
// Si tu as ces guards, décommente-les
// import { authGuard } from '@app/core/auth/auth.guard';
// import { adminGuard } from '@app/core/auth/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    // canActivate: [authGuard, adminGuard],
    // canActivateChild: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'reports', pathMatch: 'full' },

      {
        path: 'reports',
        title: 'Admin · Reports',
        data: { breadcrumb: 'Reports' },
        loadComponent: () =>
          import('./reports/reports.component').then(m => m.ReportsComponent),
      },
      {
        path: 'users',
        title: 'Admin · Users',
        data: { breadcrumb: 'Users' },
        loadComponent: () =>
          import('./users/users.component').then(m => m.UsersComponent),
      },
      {
        path: 'programs',
        title: 'Admin · Programs',
        data: { breadcrumb: 'Programs' },
        loadComponent: () =>
          import('./programs/programs.component').then(m => m.ProgramsComponent),
      },
      {
        path: 'rewards',
        title: 'Admin · Rewards',
        data: { breadcrumb: 'Rewards' },
        loadComponent: () =>
          import('./rewards/rewards.component').then(m => m.RewardsComponent),
      },

      // Badges (sous-routes list/create/edit)
      {
        path: 'badges',
        title: 'Admin · Badges',
        data: { breadcrumb: 'Badges' },
        loadChildren: () =>
          import('./badges/admin-badges.routes').then(m => m.ADMIN_BADGES_ROUTES),
      },

      // Vulnerabilities
      {
        path: 'vulnerabilities',
        title: 'Admin · Vulnerabilities',
        data: { breadcrumb: 'Vulnerabilities' },
        loadComponent: () =>
          import('./vulnerabilities/vulnerabilities.component')
            .then(m => m.VulnerabilitiesComponent),
      },

      // Challenges (sous-routes)
      {
        path: 'challenges',
        title: 'Admin · Challenges',
        data: { breadcrumb: 'Challenges' },
        loadChildren: () =>
          import('./challenges/admin-challenges.routes').then(m => m.adminChallengesRoutes),
      },

      // Fallback interne de l’admin
      { path: '**', redirectTo: 'reports' }
    ],
  },
];
