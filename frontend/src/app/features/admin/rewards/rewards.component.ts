// rewards.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';   // 👈 NEW
import { RewardsAdminService } from './rewards-admin.service';
import { DateFormatPipe } from '@app/shared/pipes/date-format.pipe';
import { RewardPayment } from '@app/models/reward.model';

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [CommonModule, FormsModule, DateFormatPipe, TranslateModule], // 👈 add TranslateModule
  templateUrl: './rewards.component.html'
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
