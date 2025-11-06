import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ReportResponse } from '@app/models/report.model';

export interface MyRewardView {
  amount: number;
  paymentDate: string; // ISO
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);

  submit(data: { title: string; severity: string; programId: number }): Observable<any> {
    return this.http.post('/api/reports', data);
  }

  getMyReports(): Observable<ReportResponse[]> {
    return this.http.get<ReportResponse[]>('/api/reports/my');
  }

  submitFormData(formData: FormData): Observable<any> {
    return this.http.post('/api/reports', formData);
  }

  hasSubmitted(programId: number): Observable<boolean> {
    return this.http
      .get<{ submitted: boolean }>(`/api/reports/submitted?programId=${programId}`)
      .pipe(map(res => res.submitted));
  }

  getCompanyReceivedReports(): Observable<ReportResponse[]> {
    return this.http.get<ReportResponse[]>('/api/reports/received');
  }

  // Download par l’entreprise (existant)
  downloadReport(id: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`/api/reports/${id}/download`, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  // ✅ NEW: reward pour MON report (204 => null)
  getMyRewardForReport(reportId: number): Observable<MyRewardView | null> {
    return this.http
      .get<MyRewardView>(`/api/reports/${reportId}/my-reward`, { observe: 'response' })
      .pipe(map(res => (res.status === 204 ? null : (res.body as MyRewardView))));
  }

  // ✅ NEW: téléchargement de MON rapport (sanitized si dispo)
  downloadOwnReport(reportId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`/api/reports/${reportId}/download-self`, {
      responseType: 'blob',
      observe: 'response',
    });
  }
}
