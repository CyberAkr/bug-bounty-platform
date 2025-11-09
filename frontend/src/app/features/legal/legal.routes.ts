import { Routes } from '@angular/router';

export const LEGAL_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'mentions' },

  {
    path: 'mentions',
    loadComponent: () =>
      import('./legal-mentions.component').then(m => m.LegalMentionsComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./contact.component').then(m => m.ContactComponent),
  },
];
