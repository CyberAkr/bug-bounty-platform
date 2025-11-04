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

  // création classique (non-paiement)
  create(dto: ProgramCreateDto): Observable<any> {
    return this.http.post<any>(this.baseUrl, dto);
  }

  // pour publier EXISTING program (flux "payer après création")
  checkout(programId: number) {
    return this.http.post<{ url: string }>(
      `/api/payments/programs/${programId}/checkout`, {}
    );
  }

  confirm(programId: number, sessionId: string) {
    return this.http.post(
      `/api/payments/programs/${programId}/confirm?sessionId=${encodeURIComponent(sessionId)}`, {}
    );
  }

  // ==== méthode CORRECTE pour création + paiement via Stripe (avant création)
  // Envoi d'un JSON dans le body (plus de query string)
  checkoutBeforeCreate(title: string, description: string) {
    const payload: ProgramCreateDto = { title, description };
    return this.http.post<{ url: string }>(
      `/api/payments/programs/checkout`,
      payload
    );
  }

  confirmSession(sessionId: string) {
    return this.http.post<{ id: number; title: string }>(
      `/api/payments/programs/confirm?sessionId=${encodeURIComponent(sessionId)}`,
      {}
    );
  }
}
