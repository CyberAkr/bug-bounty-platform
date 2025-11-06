import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { RewardPayment } from '@app/models/reward.model';

@Injectable({ providedIn: 'root' })
export class RewardsAdminService {
  private http = inject(HttpClient);

  rewards = signal<RewardPayment[]>([]);
  loading = signal(false);
  creating = signal(false);
  uploading = signal<number | null>(null); // paymentId en cours d'upload

  loadAll() {
    this.loading.set(true);
    this.http.get<RewardPayment[]>('/api/admin/rewards').subscribe({
      next: (data) => { this.rewards.set(data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  createReward(reportId: number, amount: number) {
    this.creating.set(true);
    const params = new HttpParams().set('amount', amount.toString());
    return this.http.post<RewardPayment>(`/api/admin/rewards/${reportId}`, null, { params }).subscribe({
      next: (created) => {
        this.rewards.set([created, ...this.rewards()]);
        this.creating.set(false);
      },
      error: (err) => { alert(err?.error || 'Création impossible'); this.creating.set(false); }
    });
  }

  uploadProof(paymentId: number, file: File) {
    const fd = new FormData();
    fd.append('file', file);
    this.uploading.set(paymentId);
    this.http.post<RewardPayment>(`/api/admin/rewards/${paymentId}/proof`, fd).subscribe({
      next: (updated) => {
        this.rewards.set(this.rewards().map(r => r.paymentId === paymentId ? updated : r));
        this.uploading.set(null);
      },
      error: (err) => { alert(err?.error || 'Upload de preuve impossible'); this.uploading.set(null); }
    });
  }

  /** Télécharge la preuve (blob) et déclenche un download côté navigateur */
  downloadProof(paymentId: number) {
    this.http.get(`/api/admin/rewards/${paymentId}/proof/file`, {
      responseType: 'blob',
      observe: 'response'
    })
      .subscribe({
      next: (res: HttpResponse<Blob>) => {
        const blob = res.body!;
        // Essaie de récupérer un filename depuis Content-Disposition
        const cd = res.headers.get('Content-Disposition') || res.headers.get('content-disposition') || '';
        const match = /filename="?(?<fn>[^"]+)"?/i.exec(cd || '');
        const filename = match?.groups?.['fn'] || `proof_${paymentId}`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        alert(err?.error || 'Téléchargement impossible');
      }
    });
  }
}
