import { ProgramDetailComponent } from '@app/features/programs/detail/program-detail/program-detail.component';

export const PROGRAMS_ROUTES = [
  {
    path: '',
    loadComponent: () =>
      import('@app/features/programs/list/program-list/program-list.component').then(
        (m) => m.ProgramListComponent
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('@app/features/programs/create/program-create/program-create.component').then(
        (m) => m.ProgramCreateComponent
      ),
  },
  {
    path: ':id',
    component: ProgramDetailComponent,
  },
];
