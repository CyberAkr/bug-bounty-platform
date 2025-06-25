import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
        import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      // 🌐 Page d’accueil par défaut
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

      // 📊 Dashboard général (détecte le rôle)
      {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // 🧑‍💼 Dashboard entreprise
      {
        path: 'company',
        canActivate: [authGuard],
        loadChildren: () =>
            import('./features/dashboard/company/company.routes')
                .then(m => m.COMPANY_ROUTES)
      },


      // 👨‍🔬 Dashboard chercheur
      {
        path: 'researcher',
        canActivate: [authGuard],
        loadChildren: () =>
            import('./features/dashboard/researcher/researcher.routes').then(m => m.researcherRoutes)
      },

      // 🛡️ Interface admin
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadChildren: () =>
            import('./features/admin/admin.routes').then(m => m.adminRoutes)
      },

      // 👤 Profil utilisateur
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/users/profile/profile.component').then(m => m.ProfileComponent)
      },

      // ⚙️ Paramètres utilisateur
      {
        path: 'settings',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/users/settings/settings.component').then(m => m.SettingsComponent)
      },

      // 📈 Classement
      {
        path: 'classement',
        loadComponent: () =>
            import('./features/ranking/ranking.component').then(m => m.RankingComponent)
      },

      // 🔎 Profil public depuis le classement
      {
        path: 'user/:id',
        loadComponent: () =>
            import('./features/users/profile-public/profile-public.component').then(m => m.ProfilePublicComponent)
      },

      // 🧪 Programmes d’audit
      {
        path: 'programs',
        loadChildren: () =>
            import('./features/programs/programs.routes').then(m => m.PROGRAMS_ROUTES)
      },

      // 📦 Rapports
      {
        path: 'reports',
        loadChildren: () =>
            import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES)
      },

      // 🧠 Défis
      {
        path: 'challenge',
        loadChildren: () =>
            import('./features/challenges/challenges.routes').then(m => m.challengesRoutes)
      },

      // 🔔 Notifications
      {
        path: 'notifications',
        loadChildren: () =>
            import('./features/notifications/notifications.routes').then(m => m.NOTIFICATIONS_ROUTES)
      }
    ]
  },

  // 🛑 Fallback : page inconnue → accueil
  {
    path: '**',
    redirectTo: 'home'
  }
];
