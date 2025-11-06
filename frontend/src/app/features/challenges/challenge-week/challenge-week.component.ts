import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ChallengesService, Challenge } from '../challenges.service';
import { ChallengeStatusPipe } from '../challenge-status.pipe';
import { TimeLeftPipe } from '../time-left.pipe';

@Component({
  selector: 'app-challenge-week',
  standalone: true,
  imports: [
    CommonModule, FormsModule, NgClass,
    MatCardModule, MatIconModule, MatButtonModule, MatChipsModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule,
    ChallengeStatusPipe, TimeLeftPipe
  ],
  templateUrl: './challenge-week.component.html'
})
export class ChallengeWeekComponent implements OnInit {
  private svc = inject(ChallengesService);
  private snack = inject(MatSnackBar);

  // état
  idx = signal(0);
  flag = signal('');
  submitting = signal(false);
  message = signal<string | null>(null);
  status = signal<'idle' | 'success' | 'error'>('idle');

  // data
  challenges = computed(() => this.svc.challenges());
  loading = computed(() => this.svc.loading());
  error = computed(() => this.svc.error());

  current = computed<Challenge | null>(() => {
    const list = this.challenges();
    const i = this.idx();
    return list.length > 0 && i >= 0 && i < list.length ? list[i] : null;
  });

  ngOnInit() {
    this.svc.loadActive();
  }

  prev() {
    const list = this.challenges();
    if (!list.length) return;
    this.idx.set((this.idx() - 1 + list.length) % list.length);
    this.resetMsg();
  }

  next() {
    const list = this.challenges();
    if (!list.length) return;
    this.idx.set((this.idx() + 1) % list.length);
    this.resetMsg();
  }

  submit() {
    const ch = this.current();
    if (!ch) return;

    this.submitting.set(true);
    this.status.set('idle');
    this.message.set(null);

    this.svc.submitFlag(ch.challengeId, this.flag()).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.status.set('success');
        this.message.set(res);
        this.snack.open('✅ Code validé !', 'OK', { duration: 2500 });
      },
      error: (err) => {
        this.submitting.set(false);
        this.status.set('error');
        this.message.set(err?.error ?? 'Une erreur est survenue');
        this.snack.open('❌ Code invalide ou déjà gagné.', 'OK', { duration: 2500 });
      }
    });
  }

  private resetMsg() {
    this.flag.set('');
    this.message.set(null);
    this.status.set('idle');
  }
}
