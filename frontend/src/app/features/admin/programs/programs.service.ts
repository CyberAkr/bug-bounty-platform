
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ProgramStatus = 'PENDING' | 'APPROVED';

export interface Program {
  program_id: number;
  title: string;
  description: string;
  status: ProgramStatus;
  company: {
    id: number;
    name: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ProgramsService {
  private http = inject(HttpClient);
  private baseUrl = '/api/admin/programs';

  getAll(): Observable<Program[]> {
    return this.http.get<Program[]>(this.baseUrl);
  }

  updateStatus(id: number, status: ProgramStatus): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/status`, { status });
  }
}
