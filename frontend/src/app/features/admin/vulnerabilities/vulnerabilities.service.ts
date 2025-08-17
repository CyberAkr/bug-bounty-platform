import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface VulnerabilityType {
  type_id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class VulnerabilitiesService {
  private http = inject(HttpClient);
  private baseUrl = '/api/admin/vulnerabilities';

  private toUi = (v: any): VulnerabilityType => ({
    type_id: v.type_id ?? v.typeId,
    name: v.name,
  });

  getAll(): Observable<VulnerabilityType[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(map(list => list.map(this.toUi)));
  }

  create(name: string): Observable<VulnerabilityType> {
    return this.http.post<any>(this.baseUrl, { name }).pipe(map(this.toUi));
  }

  update(id: number, name: string): Observable<VulnerabilityType> {
    return this.http.patch<any>(`${this.baseUrl}/${id}`, { name }).pipe(map(this.toUi));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
