import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      // 🚪 Redirection par défaut
      { path: '', redirectTo: 'home', pathMatch: 'full' },

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
      // ✅ Vérification d’e-mail
      {
        path: 'verify-email',
        loadComponent: () =>
          import('./features/auth/verify-email/verify-email.component').then(m => m.default)
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.component').then(m => m.default)
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password.component').then(m => m.default)
      },

      // 📊 Tableau de bord utilisateur
      {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // 🏆 Classement
      {
        path: 'classement',
        loadComponent: () =>
          import('./features/ranking/pages/ranking.component').then(m => m.RankingComponent)
      },

      // 👤 Profil public (via classement)
      {
        path: 'user/:id',
        loadComponent: () =>
          import('./features/users/profile-public/profile-public.component').then(m => m.ProfilePublicComponent)
      },

      // 🏢 Espace entreprise
      {
        path: 'company',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/dashboard/company/company.routes').then(m => m.COMPANY_ROUTES)
      },

      // 🧑‍💻 Espace chercheur
      {
        path: 'researcher',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/dashboard/researcher/researcher.routes').then(m => m.RESEARCHER_ROUTES)
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

      // 🧩 Programmes d’audit
      {
        path: 'programs',
        loadChildren: () =>
          import('./features/programs/programs.routes').then(m => m.PROGRAMS_ROUTES)
      },

      // 🧪 Rapports
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES)
      },

      // 🎯 Challenges
      {
        path: 'challenge',
        loadChildren: () =>
          import('./features/challenges/challenges.routes').then(m => m.challengesRoutes)
      },

      // 💬 Forum communautaire
      {
        path: 'forum',
        canActivate: [authGuard], // réservé aux connectés
        loadChildren: () =>
          import('./features/forum/forum.routes').then(m => m.default)
      },

      // 🔔 Notifications
      {
        path: 'notifications',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/notifications/notifications.routes').then(m => m.NOTIFICATIONS_ROUTES)
      },

      // ⚖️ Pages légales (routes explicites)
      {
        path: 'legal/contact',
        loadComponent: () =>
          import('./features/legal/contact/contact.component').then(m => m.ContactComponent)
      },
      {
        path: 'legal/mentions',
        loadComponent: () =>
          import('./features/legal/mentions/mentions.component').then(m => m.MentionsComponent)
      },
      {
        path: 'legal/privacy',
        loadComponent: () =>
          import('./features/legal/privacy/privacy.component').then(m => m.PrivacyComponent)
      },
      {
        path: 'legal/terms',
        loadComponent: () =>
          import('./features/legal/terms/terms.component').then(m => m.TermsComponent)
      },
      {
        path: 'legal/cookies',
        loadComponent: () =>
          import('./features/legal/cookies/cookies.component').then(m => m.CookiesComponent)
      },
      {
        path: 'legal/bugbounty-policy',
        loadComponent: () =>
          import('./features/legal/bugbounty-policy/bugbounty-policy.component')
            .then(m => m.BugBountyPolicyComponent)
      },

      // 🌐 Redirections pratiques
      {
        path: 'contact',
        redirectTo: 'legal/contact',
        pathMatch: 'full'
      },
      {
        path: 'mentions-legales',
        redirectTo: 'legal/mentions',
        pathMatch: 'full'
      },

      // 🛠️ Administration
      {
        path: 'admin',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/admin/admin.routes').then(m => m.adminRoutes)
      }
    ]
  },

  // 🚨 Page non trouvée
  { path: '**', redirectTo: 'home' }
];
