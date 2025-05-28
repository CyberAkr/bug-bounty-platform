import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReportResponse } from '@app/models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);

  submit(data: { title: string; severity: string; programId: number }): Observable<any> {
    return this.http.post('/api/reports', data);
  }


  getMyReports(): Observable<ReportResponse[]> {
    return this.http.get<ReportResponse[]>('/api/reports/my');
  }
}
