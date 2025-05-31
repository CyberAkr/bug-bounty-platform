
// program-row.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Program, ProgramStatus } from '@app/features/admin/programs/programs.service';

@Component({
  selector: 'app-program-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <tr class="border-b">
      <td class="px-4 py-2">{{ program.title }}</td>
      <td class="px-4 py-2 text-sm">{{ program.description }}</td>
      <td class="px-4 py-2">{{ program.company.name }}</td>
      <td class="px-4 py-2">
        <span class="px-2 py-1 text-xs rounded"
              [class.bg-green-200]="program.status === 'APPROVED'"
              [class.bg-yellow-200]="program.status === 'PENDING'">
          {{ program.status }}
        </span>
      </td>
      <td class="px-4 py-2">
        <button *ngIf="program.status === 'PENDING'"
                (click)="action.emit({ id: program.program_id, status: 'APPROVED' })"
                class="bg-blue-500 text-white px-2 py-1 rounded text-sm">
          ✅ Approuver
        </button>
      </td>
    </tr>
  `,
})
export class ProgramRowComponent {
  @Input() program!: Program;
  @Output() action = new EventEmitter<{ id: number; status: ProgramStatus }>();
}

