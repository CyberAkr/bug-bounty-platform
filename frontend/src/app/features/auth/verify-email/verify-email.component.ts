import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {AuthService} from '@app/core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-verify-email',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container" style="max-width:480px;margin:2rem auto;">
      <h2>Vérification de votre e-mail</h2>
      <p>Nous avons envoyé un code à <strong>{{ email() }}</strong>.</p>

      <form (ngSubmit)="onSubmit()">
        <label for="code">Code à 6 chiffres</label>
        <input id="code" name="code" [(ngModel)]="codeValue" maxlength="6" required
               pattern="\\d{6}" class="w-full" />

        <div style="display:flex; gap:.5rem; margin-top:1rem;">
          <button type="submit" [disabled]="loading()">Valider</button>
          <button type="button" (click)="onResend()" [disabled]="loading()">Renvoyer le code</button>
        </div>
      </form>

      <p *ngIf="error()" style="color:#c00;margin-top:1rem;">{{ error() }}</p>
      <p *ngIf="success()" style="color:#080;margin-top:1rem;">{{ success() }}</p>
    </div>
  `
})
export default class VerifyEmailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  email = signal<string>('');
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  codeValue = '';

  constructor() {
    const fromQuery = this.route.snapshot.queryParamMap.get('email');
    const fromState = this.auth.emailPendingVerification();
    this.email.set(fromQuery || fromState || '');
  }

  onSubmit() {
    if (!this.email()) { this.error.set('Email manquant.'); return; }
    this.loading.set(true);
    this.error.set(null); this.success.set(null);

    this.auth.verifyEmail(this.email(), this.codeValue).subscribe({
      next: res => {
        if (res.status === 'verified') {
          this.success.set('Adresse vérifiée ! Vous pouvez vous connecter.');
          this.loading.set(false);
          this.router.navigate(['/login']);
        } else {
          this.error.set('Code invalide ou expiré.');
          this.loading.set(false);
        }
      },
      error: () => {
        this.error.set('Code invalide ou expiré.');
        this.loading.set(false);
      }
    });
  }

  onResend() {
    if (!this.email()) { this.error.set('Email manquant.'); return; }
    this.loading.set(true);
    this.error.set(null); this.success.set(null);

    this.auth.resendCode(this.email()).subscribe({
      next: () => {
        this.success.set('Code renvoyé. Vérifiez votre boîte mail.');
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de renvoyer le code pour le moment.');
        this.loading.set(false);
      }
    });
  }
}
