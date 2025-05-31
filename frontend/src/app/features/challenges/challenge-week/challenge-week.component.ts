import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-challenge-week',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './challenge-week.component.html'
})
export class ChallengeWeekComponent implements OnInit {
  private http = inject(HttpClient);

  challenge = signal<any>(null);
  flag = signal('');
  message = signal('');
  badgeEarned = signal(false);
  status = signal<'idle' | 'success' | 'error'>('idle');

  ngOnInit() {
    this.http.get('/api/challenge/current').subscribe({
      next: (data) => this.challenge.set(data),
      error: () => this.message.set("❌ Aucun défi actif pour l'instant.")
    });
  }

  submit() {
    this.status.set('idle');
    const body = {
      challengeId: this.challenge().challengeId,
      flag: this.flag()
    };

    this.http.post('/api/challenge/submit', body, { responseType: 'text' }).subscribe({
      next: (res) => {
        this.message.set(res);
        this.status.set('success');
        if (res.includes("badge")) {
          this.badgeEarned.set(true);
        }
      },
      error: (err) => {
        this.message.set(err.error);
        this.status.set('error');
      }
    });
  }
}
