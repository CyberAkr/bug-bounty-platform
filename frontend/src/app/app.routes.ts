import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      // 🚪 Redirection vers la page d'accueil
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },

      // 🏠 Accueil public
      {
        path: 'home',
        loadComponent: () =>
          import('./features/public/home/home.component').then(m => m.HomeComponent)
      },

      // 🔐 Authentification
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },

      // 📊 Dashboard utilisateur (optionnel)
      {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // 👤 Profil utilisateur
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/users/profile/profile.component').then(m => m.ProfileComponent)
      },

      // ⚙️ Paramètres utilisateur (optionnel)
      {
        path: 'settings',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/users/settings/settings.component').then(m => m.SettingsComponent)
      },

      // 📦 Programmes d'audit (liste, détail, création)
      {
        path: 'programs',
        loadChildren: () =>
          import('./features/programs/programs.routes').then(m => m.PROGRAMS_ROUTES)
      },

      // 🧪 Rapports (soumission uniquement)
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES)
      },

      // 🔔 Notifications
      {
        path: 'notifications',
        loadChildren: () =>
          import('./features/notifications/notifications.routes').then(m => m.NOTIFICATIONS_ROUTES)
      }
    ]
  },

  // 🚨 Route fallback
  {
    path: '**',
    redirectTo: 'home'
  }
];
