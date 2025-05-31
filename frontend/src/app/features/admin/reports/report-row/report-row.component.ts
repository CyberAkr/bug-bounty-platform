
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Report, ReportStatus } from '@app/features/admin/reports/report.service';
import { VulnerabilityType } from '@app/features/admin/vulnerabilities/vulnerabilities.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-report-row',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <tr class="border-b">
      <td class="px-4 py-2">{{ report.title }}</td>
      <td class="px-4 py-2">{{ report.severity }}</td>
      <td class="px-4 py-2">{{ report.researcher.username }}</td>
      <td class="px-4 py-2">{{ report.submitted_at | date:'short' }}</td>
      <td class="px-4 py-2">
        <select [(ngModel)]="report.vulnerability_type_id" class="text-sm border rounded p-1 w-full">
          <option *ngFor="let vuln of vulnerabilities" [value]="vuln.type_id">{{ vuln.name }}</option>
        </select>
        <button (click)="updateVulnerability.emit({ reportId: report.report_id, vulnerabilityId: report.vulnerability_type_id })"
                class="mt-1 bg-blue-600 text-white px-2 py-1 rounded text-xs">
          💾 Mettre à jour
        </button>
      </td>
      <td class="px-4 py-2">
        <textarea [(ngModel)]="comment" class="text-sm border rounded w-full p-1"></textarea>
      </td>
      <td class="px-4 py-2 space-x-1">
        <button (click)="action.emit({ id: report.report_id, status: 'APPROVED', comment })" class="bg-green-500 text-white px-2 py-1 rounded text-sm">✅ Valider</button>
        <button (click)="action.emit({ id: report.report_id, status: 'REJECTED', comment })" class="bg-red-500 text-white px-2 py-1 rounded text-sm">❌ Refuser</button>
      </td>
    </tr>
  `,
})
export class ReportRowComponent {
  @Input() report!: Report;
  @Input() vulnerabilities: VulnerabilityType[] = [];
  @Output() action = new EventEmitter<{ id: number; status: ReportStatus; comment: string }>();
  @Output() updateVulnerability = new EventEmitter<{ reportId: number; vulnerabilityId: number }>();

  comment: string = '';
}
