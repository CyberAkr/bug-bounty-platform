
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VulnerabilityType {
  type_id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class VulnerabilitiesService {
  private http = inject(HttpClient);
  private baseUrl = '/api/vulnerabilities';

  getAll(): Observable<VulnerabilityType[]> {
    return this.http.get<VulnerabilityType[]>(this.baseUrl);
  }

  create(name: string): Observable<VulnerabilityType> {
    return this.http.post<VulnerabilityType>(this.baseUrl, { name });
  }

  update(id: number, name: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}`, { name });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

