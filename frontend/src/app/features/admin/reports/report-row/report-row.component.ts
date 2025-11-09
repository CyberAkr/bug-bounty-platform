import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Report } from '../report.service';
import { VulnerabilityType } from '../../vulnerabilities/vulnerabilities.service';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'tr[app-report-row]',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  host: { class: 'border-b last:border-0 hover:bg-gray-50' },
  templateUrl: './report-row.component.html',
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
