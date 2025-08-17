import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// DTO attendu par ton backend: AuditProgramRequestDTO { title, description }
export interface ProgramCreateDto {
  title: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class ProgramService {
  private http = inject(HttpClient);
  private baseUrl = '/api/programs';

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getOne(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  getMine(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/my`);
  }

  // 👇 nouvelle méthode pour créer un programme (entreprise connectée)
  create(dto: ProgramCreateDto): Observable<any> {
    // le backend renvoie "Programme soumis avec succès." (string) → on accepte any
    return this.http.post<any>(this.baseUrl, dto);
  }
}
