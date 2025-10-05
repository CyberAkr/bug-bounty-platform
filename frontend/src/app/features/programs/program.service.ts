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

  // 👇 ancienne méthode (non utilisée ici)
  create(dto: ProgramCreateDto): Observable<any> {
    return this.http.post<any>(this.baseUrl, dto);
  }

  // ✅ Pour la publication AVEC paiement
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

  // ✅ Nouvelle méthode Stripe avant création
  checkoutBeforeCreate(title: string, description: string) {
    const params = new URLSearchParams();
    params.set('title', title);
    params.set('description', description);
    return this.http.post<{ url: string }>(
      `/api/payments/programs/checkout?${params.toString()}`, {}
    );
  }

  confirmSession(sessionId: string) {
    return this.http.post<{ id: number; title: string }>(
      `/api/payments/programs/confirm?sessionId=${encodeURIComponent(sessionId)}`,
      {}
    );
  }


}
