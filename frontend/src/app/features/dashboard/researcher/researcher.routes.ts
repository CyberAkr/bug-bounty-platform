import { Routes } from '@angular/router';

// Chargement direct pour la page d’accueil chercheur
import { ResearcherWelcomeComponent } from './welcome/researcher-welcome.component';

export const RESEARCHER_ROUTES: Routes = [
  { path: '', component: ResearcherWelcomeComponent },

  // Lazy load des autres sous-pages
  {
    path: 'guide',
    loadComponent: () =>
      import('./report-guide/report-guide.component')
        .then(m => m.ReportGuideComponent)
  },
  {
    path: 'example',
    loadComponent: () =>
      import('./bounty-example/bounty-example.component')
        .then(m => m.BountyExampleComponent)
  },
  {
    path: 'training',
    loadComponent: () =>
      import('./training/researcher-training.component')
        .then(m => m.ResearcherTrainingComponent)
  },
  {
    path: 'thanks',
    loadComponent: () =>
      import('./thanks/researcher-thanks.component')
        .then(m => m.ResearcherThanksComponent)
  }
];
