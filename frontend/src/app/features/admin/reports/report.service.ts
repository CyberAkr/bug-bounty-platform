import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type ReportStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Report {
  report_id: number;
  id: number; // utilisé par Angular dans les composants
  title: string;
  submitted_at: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  researcher: { id: number; username: string };
  status: ReportStatus;
  admin_comment?: string;
  vulnerability_type_id: number;
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private http = inject(HttpClient);
  private baseUrl = '/api/admin/reports';

  private mapReport = (report: any): Report => ({
    ...report,
    id: report.report_id,
  });

  getAllReports(): Observable<Report[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map(reports => reports.map(this.mapReport))
    );
  }

  getPendingReports(): Observable<Report[]> {
    return this.http.get<any[]>(`${this.baseUrl}?status=PENDING`).pipe(
      map(reports => reports.map(this.mapReport))
    );
  }

  updateStatus(reportId: number, status: ReportStatus, comment: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${reportId}/status`, {
      status,
      admin_comment: comment,
    });
  }

  updateVulnerability(reportId: number, vulnerability_type_id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${reportId}/vulnerability`, {
      vulnerability_type_id,
    });
  }

  updateReport(reportId: number, update: Partial<Report>): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${reportId}`, update);
  }

  deleteReport(reportId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${reportId}`);
  }
}
