import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export type ProgramStatus = 'PENDING' | 'APPROVED' | 'ARCHIVED';

export interface Program {
  program_id: number;
  title: string;
  description: string;
  status: ProgramStatus;
  company: { id: number | null; name: string };
}

export interface ProgramCreate {
  title: string;
  description: string;
  companyId: number;
  status?: ProgramStatus;
}

export interface ProgramUpdate {
  title?: string;
  description?: string;
  status?: ProgramStatus;
}

@Injectable({ providedIn: 'root' })
export class ProgramsService {
  private http = inject(HttpClient);
  private baseUrl = '/api/admin/programs'; // ✅ endpoints admin

  private toUi = (r: any): Program => ({
    program_id: r.id ?? r.program_id,
    title: r.title,
    description: r.description,
    status: (r.status ?? 'PENDING') as ProgramStatus,
    company: { id: r.companyId ?? null, name: r.companyName ?? '—' },
  });

  getAll(status?: ProgramStatus): Observable<Program[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<any[]>(this.baseUrl, { params }).pipe(map(list => list.map(this.toUi)));
  }

  create(dto: ProgramCreate): Observable<Program> {
    return this.http.post<any>(this.baseUrl, dto).pipe(map(this.toUi));
  }

  update(id: number, dto: ProgramUpdate): Observable<Program> {
    return this.http.patch<any>(`${this.baseUrl}/${id}`, dto).pipe(map(this.toUi));
  }

  updateStatus(id: number, status: ProgramStatus): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
