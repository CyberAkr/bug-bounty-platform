import { Routes } from '@angular/router';
import { CompanyWelcomeComponent } from './company-welcome/company-welcome.component';
import { CompanyReceivedReportsComponent } from '@app/features/reports/company-received/company-received.component';

export const COMPANY_ROUTES: Routes = [
  { path: '', component: CompanyWelcomeComponent },
  { path: 'create', loadComponent: () =>
      import('@app/features/programs/create/program-create/program-create.component')
        .then(m => m.ProgramCreateComponent)
  },
  { path: 'reports', component: CompanyReceivedReportsComponent }
];
