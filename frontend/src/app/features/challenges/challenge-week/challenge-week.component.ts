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

import { TranslateModule } from '@ngx-translate/core';

import { ChallengesService, Challenge } from '../challenges.service';
import { ChallengeStatusPipe } from '../challenge-status.pipe';
import { TimeLeftPipe } from '../time-left.pipe';

@Component({
  selector: 'app-challenge-week',
  standalone: true,
  imports: [
    CommonModule, FormsModule, NgClass,
    TranslateModule,
    MatCardModule, MatIconModule, MatButtonModule, MatChipsModule,
    MatProgressSpinnerModule, MatFormFieldModule, MatInputModule,
    ChallengeStatusPipe, TimeLeftPipe
  ],
  templateUrl: './challenge-week.component.html'
})
export class ChallengeWeekComponent implements OnInit {
  private svc = inject(ChallengesService);

  // état
  idx        = signal(0);
  flag       = signal('');
  submitting = signal(false);
  status     = signal<'idle' | 'success' | 'error'>('idle');
  // bulle inline
  bubble = signal<{ type: 'success' | 'error'; key: string } | null>(null);

  // data
  challenges = computed(() => this.svc.challenges());
  loading    = computed(() => this.svc.loading());
  error      = computed(() => this.svc.error());

  current = computed<Challenge | null>(() => {
    const list = this.challenges();
    const i = this.idx();
    return list.length > 0 && i >= 0 && i < list.length ? list[i] : null;
  });

  ngOnInit() { this.svc.loadActive(); }

  prev() {
    const list = this.challenges();
    if (!list.length) return;
    this.idx.set((this.idx() - 1 + list.length) % list.length);
    this.clearUi();
  }

  next() {
    const list = this.challenges();
    if (!list.length) return;
    this.idx.set((this.idx() + 1) % list.length);
    this.clearUi();
  }

  submit() {
    const ch = this.current();
    if (!ch) return;

    this.submitting.set(true);
    this.status.set('idle');
    this.bubble.set(null);

    this.svc.submitFlag(ch.challengeId, this.flag()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.status.set('success');
        this.bubble.set({ type: 'success', key: 'challenges.weekly.msg.valid' });
        this.autoHideBubble();
      },
      error: () => {
        this.submitting.set(false);
        this.status.set('error');
        this.bubble.set({ type: 'error', key: 'challenges.weekly.msg.invalid' });
        this.autoHideBubble();
      }
    });
  }

  private autoHideBubble() {
    setTimeout(() => {
      if (this.status() !== 'idle') this.bubble.set(null);
    }, 3000);
  }

  private clearUi() {
    this.flag.set('');
    this.status.set('idle');
    this.bubble.set(null);
  }
}
