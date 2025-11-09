import { Routes } from '@angular/router';
import { ReportSubmitComponent } from '@app/features/reports/submit/report-submit/report-submit.component';
import { CompanyReceivedReportsComponent } from '@app/features/reports/company-received/company-received.component';
import { MyReportsComponent } from '@app/features/reports/my-reports/my-reports.component';

export const REPORTS_ROUTES: Routes = [
  { path: 'submit', component: ReportSubmitComponent },
  { path: 'received', component: CompanyReceivedReportsComponent },
  { path: 'my', component: MyReportsComponent }
];
