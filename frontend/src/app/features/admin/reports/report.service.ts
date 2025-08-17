// frontend/src/app/features/admin/reports/report.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export type ReportStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Report {
  report_id: number;
  title: string;
  submitted_at: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  researcher: { id: number | null; username: string };
  status: ReportStatus;
  admin_comment?: string | null;
  vulnerability_type_id: number | null;
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private http = inject(HttpClient);
  private baseUrl = '/api/admin/reports';

  /** Adaptateur backend -> UI */
  private toUi(r: any): Report {
    return {
      report_id: r.report_id ?? r.reportId,
      title: r.title,
      submitted_at: r.submitted_at ?? r.submittedAt,
      severity: (r.severity ?? '').toUpperCase(),
      researcher: {
        id: r.researcher?.id ?? r.researcher?.userId ?? null,
        username: r.researcher?.username ?? ''
      },
      status: (r.status ?? '').toUpperCase(),
      admin_comment: r.admin_comment ?? r.adminComment ?? null,
      vulnerability_type_id:
        r.vulnerability_type_id ??
        r.vulnerabilityTypeId ??
        r.vulnerabilityType?.typeId ??
        null,
    };
  }

  getAllReports(): Observable<Report[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map(list => list.map(r => this.toUi(r)))
    );
  }

  getPendingReports(): Observable<Report[]> {
    const params = new HttpParams().set('status', 'PENDING');
    return this.http.get<any[]>(this.baseUrl, { params }).pipe(
      map(list => list.map(r => this.toUi(r)))
    );
  }

  updateStatus(reportId: number, status: ReportStatus, comment: string) {
    const body = { status, adminComment: comment?.trim() || undefined };
    return this.http.patch<void>(`${this.baseUrl}/${reportId}/status`, body);
  }

  updateVulnerability(id: number, vulnerability_type_id: number) {
    const body = { vulnerabilityTypeId: vulnerability_type_id };
    return this.http.patch<void>(`${this.baseUrl}/${id}/vulnerability`, body);
  }

  deleteReport(reportId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${reportId}`);
  }
}
