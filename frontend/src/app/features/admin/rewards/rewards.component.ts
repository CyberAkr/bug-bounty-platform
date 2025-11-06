import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RewardsAdminService } from './rewards-admin.service';
import { DateFormatPipe } from '@app/shared/pipes/date-format.pipe';
import { RewardPayment } from '@app/models/reward.model';

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [CommonModule, FormsModule, DateFormatPipe],
  template: `
    <div class="mx-auto max-w-6xl p-4 space-y-6">
      <header class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Gestion des récompenses</h1>
      </header>

      <!-- Création d'une récompense -->
      <section class="rounded-xl border p-4 space-y-3 bg-white">
        <h2 class="font-medium">Créer une récompense</h2>
        <form (ngSubmit)="create()" class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label class="block text-sm mb-1">Report ID</label>
            <input type="number" class="w-full border rounded px-3 py-2"
                   [(ngModel)]="reportId" name="reportId" required />
          </div>
          <div>
            <label class="block text-sm mb-1">Montant (€)</label>
            <input type="number" min="0" step="0.01" class="w-full border rounded px-3 py-2"
                   [(ngModel)]="amount" name="amount" required />
          </div>
          <div class="text-sm text-gray-600">
            <div class="mb-1">La date de paiement sera <b>mise automatiquement</b> côté serveur.</div>
            <div>Preuve à joindre <i>après</i> création (ci-dessous).</div>
          </div>
          <div class="flex gap-2">
            <button type="submit"
                    [disabled]="svc.creating() || !reportId || !isAmountValid()"
                    class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
              {{ svc.creating() ? 'Création…' : 'Créer' }}
            </button>
            <button type="button" class="px-4 py-2 rounded border"
                    (click)="resetForm()" [disabled]="svc.creating()">Réinitialiser</button>
          </div>
        </form>
      </section>

      <!-- Liste des récompenses -->
      <section class="rounded-xl border p-0 overflow-hidden">
        <div class="px-4 py-3 bg-gray-50 flex items-center justify-between">
          <h2 class="font-medium">Historique des récompenses</h2>
          <button class="text-sm px-3 py-1 rounded border"
                  (click)="reload()" [disabled]="svc.loading()">↻ Actualiser</button>
        </div>

        <div *ngIf="svc.loading()" class="p-4 text-sm text-gray-500">Chargement…</div>

        <div *ngIf="!svc.loading() && rows().length === 0" class="p-4 text-sm text-gray-500">
          Aucune récompense pour le moment.
        </div>

        <table *ngIf="rows().length > 0" class="min-w-full text-sm">
          <thead class="bg-gray-100 text-left">
          <tr>
            <th class="px-4 py-2">ID</th>
            <th class="px-4 py-2">Report ID</th>
            <th class="px-4 py-2">Montant</th>
            <th class="px-4 py-2">Payé le</th>
            <th class="px-4 py-2">Preuve</th>
            <th class="px-4 py-2">Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr *ngFor="let r of rows()" class="border-t">
            <td class="px-4 py-2">{{ r.paymentId }}</td>
            <td class="px-4 py-2">{{ r.report?.reportId ?? '—' }}</td>
            <td class="px-4 py-2">{{ r.amount | number:'1.2-2' }} €</td>
            <td class="px-4 py-2">{{ r.paymentDate | dateFormat:{ withTime: true } }}</td>
            <td class="px-4 py-2">
                <span class="inline-flex items-center gap-1"
                      [class.text-green-700]="!!r.proofUrl"
                      [class.text-red-700]="!r.proofUrl">
                  <span class="text-lg">{{ r.proofUrl ? '✓' : '✗' }}</span>
                  <span>{{ r.proofUrl ? 'Présente' : 'Manquante' }}</span>
                </span>
            </td>
            <td class="px-4 py-2 flex gap-2">
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input type="file" class="hidden"
                       (change)="onFilePicked($event, r.paymentId)"
                       accept="application/pdf,image/png,image/jpeg" />
                <span class="px-3 py-1 rounded border">
                    {{ svc.uploading() === r.paymentId ? 'Envoi…' : (r.proofUrl ? 'Remplacer la preuve' : 'Ajouter une preuve') }}
                  </span>
              </label>

              <button class="px-3 py-1 rounded border"
                      *ngIf="r.proofUrl"
                      (click)="svc.downloadProof(r.paymentId)">
                Télécharger
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </section>
    </div>
  `,
})
export class RewardsComponent implements OnInit {
  svc = inject(RewardsAdminService);

  rows = signal<RewardPayment[]>([]);
  reportId: number | null = null;
  amount: number | null = null;

  ngOnInit() { this.reload(); }

  reload() {
    this.svc.loadAll();
    const sub = setInterval(() => {
      this.rows.set(this.svc.rewards());
      if (!this.svc.loading()) clearInterval(sub);
    }, 50);
  }

  isAmountValid() {
    return typeof this.amount === 'number' && this.amount >= 0;
  }

  resetForm() { this.reportId = null; this.amount = null; }

  create() {
    if (!this.reportId || !this.isAmountValid()) return;
    this.svc.createReward(this.reportId, this.amount!);
  }

  onFilePicked(ev: Event, paymentId: number) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.svc.uploadProof(paymentId, file);
    input.value = '';
  }
}
