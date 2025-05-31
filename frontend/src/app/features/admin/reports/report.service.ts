
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ReportStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Report {
  report_id: number;
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
  private baseUrl = '/api/reports';

  // Obtenir tous les rapports
  getAllReports(): Observable<Report[]> {
    return this.http.get<Report[]>(this.baseUrl);
  }

  // Obtenir uniquement les rapports en attente
  getPendingReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.baseUrl}?status=PENDING`);
  }

  // Mettre à jour le statut d'un rapport (APPROVED / REJECTED)
  updateStatus(reportId: number, status: ReportStatus, comment: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${reportId}/status`, { status, admin_comment: comment });
  }

  // Mettre à jour le type de vulnérabilité associé au rapport
  updateVulnerability(id: number, vulnerability_type_id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/vulnerability`, { vulnerability_type_id });
  }

  // Mettre à jour des champs libres d'un rapport (optionnel, complet)
  updateReport(reportId: number, update: Partial<Report>): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${reportId}`, update);
  }

  // Supprimer un rapport (optionnel, à activer selon les droits)
  deleteReport(reportId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${reportId}`);
  }
}
