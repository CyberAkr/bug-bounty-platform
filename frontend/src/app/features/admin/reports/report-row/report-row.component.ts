import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Report, ReportStatus } from '@app/features/admin/reports/report.service';
import { VulnerabilityType } from '@app/features/admin/vulnerabilities/vulnerabilities.service';

@Component({
  selector: 'app-report-row',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-row.component.html',
})
export class ReportRowComponent {
  @Input() report!: Report;
  @Input() vulnerabilities: VulnerabilityType[] = [];

  @Output() action = new EventEmitter<{ id: number; status: ReportStatus; comment: string }>();
  @Output() updateVulnerability = new EventEmitter<{ reportId: number; vulnerabilityId: number }>();

  comment = signal('');

  onStatusChange(status: ReportStatus): void {
    this.action.emit({ id: this.report.id, status, comment: this.comment() });
  }

  onVulnerabilityChange(vulnId: number): void {
    this.report.vulnerability_type_id = vulnId; // on garde l’état localement
    if (this.report?.id && vulnId) {
      this.updateVulnerability.emit({ reportId: this.report.id, vulnerabilityId: vulnId });
    } else {
      console.warn('❌ ID manquant dans onVulnerabilityChange', this.report.id, vulnId);
    }
  }
}
