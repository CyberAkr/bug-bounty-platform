import { Routes } from '@angular/router';

export const ADMIN_BADGES_ROUTES: Routes = [
  // Liste
  {
    path: '',
    loadComponent: () =>
      import('./admin-badges-list.component').then(m => m.AdminBadgesListComponent),
  },
  // Création
  {
    path: 'create',
    loadComponent: () =>
      import('./admin-badge-form.component').then(m => m.AdminBadgeFormComponent),
  },
  // Edition
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./admin-badge-form.component').then(m => m.AdminBadgeFormComponent),
  },
];
