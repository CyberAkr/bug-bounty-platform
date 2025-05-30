import { Routes } from '@angular/router';
import { CompanyWelcomeComponent } from '@app/features/dashboard/company/company-welcome/company-welcome.component';

export const COMPANY_ROUTES: Routes = [
  {
    path: '',
    component: CompanyWelcomeComponent,
    // canActivate: [authGuard]
  },
  {
    path: 'create',
    loadComponent: () =>
      import('@app/features/programs/create/program-create/program-create.component')
        .then(m => m.ProgramCreateComponent),
    // canActivate: [authGuard]
  }
];
