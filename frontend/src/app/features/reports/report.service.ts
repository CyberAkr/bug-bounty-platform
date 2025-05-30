import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map, Observable} from 'rxjs';
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
  submitFormData(formData: FormData): Observable<any> {
    return this.http.post('/api/reports', formData);
  }

hasSubmitted(programId: number): Observable<boolean> {
  return this.http
    .get<{ submitted: boolean }>(`/api/reports/submitted?programId=${programId}`)
    .pipe(map(res => res.submitted));
}



}
