import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Report } from '@app/features/admin/reports/report.service';
import { VulnerabilityType } from '@app/features/admin/vulnerabilities/vulnerabilities.service';

@Component({
  selector: 'tr[app-report-row]',            // ✅ host = <tr>
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: { class: 'border-b last:border-0 hover:bg-gray-50' },
  template: `

    <td class="px-4 py-3 align-top font-mono text-slate-600">
      {{ report.report_id }}
    </td>

    <!-- Titre + chips statut/sévérité -->
    <td class="px-4 py-3 align-top">
      <div class="font-medium">{{ report.title || '—' }}</div>
      <div class="mt-1 inline-flex items-center gap-2 text-xs">
        <span class="px-2 py-0.5 rounded-full border"
              [class.bg-yellow-50]="report.status === 'PENDING'"
              [class.border-yellow-300]="report.status === 'PENDING'">
          {{ report.status }}
        </span>
        <span class="px-2 py-0.5 rounded-full border"
              [class.bg-red-50]="report.severity === 'HIGH'"
              [class.border-red-300]="report.severity === 'HIGH'"
              [class.bg-orange-50]="report.severity === 'MEDIUM'"
              [class.border-orange-300]="report.severity === 'MEDIUM'"
              [class.bg-green-50]="report.severity === 'LOW'"
              [class.border-green-300]="report.severity === 'LOW'">
          {{ report.severity }}
        </span>
      </div>
    </td>

    <td class="px-4 py-3 align-top">{{ report.severity }}</td>
    <!-- 🔧 Suppression de l'optional chaining (NG8107) -->
    <td class="px-4 py-3 align-top">{{ report.researcher.username || '—' }}</td>
    <td class="px-4 py-3 align-top">{{ report.submitted_at | date:'short' }}</td>

    <td class="px-4 py-3 align-top min-w-44">
      <div class="flex items-center gap-2">
        <select [(ngModel)]="report.vulnerability_type_id" class="text-sm border rounded p-1 w-full">
          <option [ngValue]="null">—</option>
          <option *ngFor="let vuln of vulnerabilities" [value]="vuln.type_id">{{ vuln.name }}</option>
        </select>
        <button
          (click)="onSaveVuln()"
          [disabled]="report.vulnerability_type_id == null"
          class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs">
          💾
        </button>
      </div>
    </td>

    <td class="px-4 py-3 align-top">
      <textarea [(ngModel)]="comment" placeholder="Commentaire admin…"
                class="text-sm border rounded w-full p-2 min-h-10"></textarea>
    </td>

    <td class="px-4 py-3 align-top">
      <div class="flex flex-wrap gap-2">
        <button (click)="preview.emit(report.report_id)"
                class="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1.5 rounded text-sm">
          👁️ Aperçu
        </button>
        <button (click)="approve.emit({ id: report.report_id, comment })"
                [disabled]="report.status === 'APPROVED'"
                class="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-sm">
          ✅ Valider
        </button>
        <button (click)="reject.emit({ id: report.report_id, comment })"
                [disabled]="report.status === 'REJECTED'"
                class="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-3 py-1.5 rounded text-sm">
          ❌ Refuser
        </button>
      </div>
    </td>
  `,
})
export class ReportRowComponent {
  @Input() report!: Report;
  @Input() vulnerabilities: VulnerabilityType[] = [];
  @Output() approve = new EventEmitter<{ id: number; comment: string }>();
  @Output() reject = new EventEmitter<{ id: number; comment: string }>();
  @Output() saveVulnerability = new EventEmitter<{ reportId: number; vulnerabilityId: number }>();
  @Output() preview = new EventEmitter<number>();

  comment = '';

  onSaveVuln() {
    if (this.report.vulnerability_type_id == null) return;
    this.saveVulnerability.emit({
      reportId: this.report.report_id,
      vulnerabilityId: this.report.vulnerability_type_id,
    });
  }
}
