
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditProgramRequest, AuditProgramResponse } from '../../models/program.model';

@Injectable({ providedIn: 'root' })
export class ProgramService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<AuditProgramResponse[]> {
    return this.http.get<AuditProgramResponse[]>('/api/programs');
  }

  getOne(id: number): Observable<AuditProgramResponse> {
    return this.http.get<AuditProgramResponse>(`/api/programs/${id}`);
  }

  getMine(): Observable<AuditProgramResponse[]> {
    return this.http.get<AuditProgramResponse[]>('/api/programs/my');
  }

  create(data: AuditProgramRequest): Observable<any> {
    return this.http.post('/api/programs', data);
  }
}
