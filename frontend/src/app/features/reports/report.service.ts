import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReportRequest, ReportResponse } from '../../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private http: HttpClient) {}

  submit(data: ReportRequest): Observable<any> {
    return this.http.post('/api/reports', data);
  }

  getMine(): Observable<ReportResponse[]> {
    return this.http.get<ReportResponse[]>('/api/reports/my');
  }

  getByProgram(programId: number): Observable<ReportResponse[]> {
    return this.http.get<ReportResponse[]>(`/api/reports/program/${programId}`);
  }
}

