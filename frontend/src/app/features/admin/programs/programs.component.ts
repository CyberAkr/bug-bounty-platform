
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Program, ProgramsService, ProgramStatus } from '@app/features/admin/programs/programs.service';
import {ProgramRowComponent} from '@app/features/admin/programs/program-row/program-row.component';

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [CommonModule, ProgramRowComponent],
  template: `
    <h1 class="text-2xl font-semibold mb-4">Programmes en attente</h1>

    <table class="w-full text-sm border bg-white rounded">
      <thead class="bg-gray-100 text-left">
        <tr>
          <th class="px-4 py-2">Titre</th>
          <th class="px-4 py-2">Description</th>
          <th class="px-4 py-2">Entreprise</th>
          <th class="px-4 py-2">Statut</th>
          <th class="px-4 py-2">Action</th>
        </tr>
      </thead>
      <tbody>
        <ng-container *ngFor="let program of programs()">
          <app-program-row [program]="program" (action)="handleAction($event)" />
        </ng-container>
      </tbody>
    </table>
  `,
})
export class ProgramsComponent {
  private service = inject(ProgramsService);
  programs = signal<Program[]>([]);

  constructor() {
    this.load();
  }

  load() {
    this.service.getAll().subscribe((data) => this.programs.set(data));
  }

  handleAction(event: { id: number; status: ProgramStatus }) {
    this.service.updateStatus(event.id, event.status).subscribe(() => this.load());
  }
}
