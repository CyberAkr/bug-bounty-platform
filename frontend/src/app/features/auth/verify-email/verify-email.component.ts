import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '@app/core/auth/auth.service';
import { UserResponse } from '@app/models/user.model';

type ResendResponse = { status: string; emailSent?: boolean };

@Component({
  standalone: true,
  selector: 'app-verify-email',
  imports: [
    CommonModule, FormsModule, TranslateModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, RouterLink,
  ],
  templateUrl: './verify-email.component.html',
})
export default class VerifyEmailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  email   = signal<string>('');
  code    = signal<string>('');
  loading = signal(false);
  error   = signal<string | null>(null);
  success = signal<string | null>(null);
  cooldown = signal<number>(0);
  private timerId: any = null;

  constructor() {
    const fromQuery   = this.route.snapshot.queryParamMap.get('email');
    const fromState   = this.auth.emailPendingVerification?.();
    const fromStorage = typeof window !== 'undefined' ? localStorage.getItem('bb.emailPending') : null;
    const resolved = fromQuery || fromState || fromStorage || '';
    this.email.set(resolved);
    if (resolved && typeof window !== 'undefined') localStorage.setItem('bb.emailPending', resolved);
  }

  onSubmit() {
    this.error.set(null); this.success.set(null);

    const email = (this.email() || '').trim();
    const code  = (this.code()  || '').trim();

    if (!email) { this.error.set('verify.errors.missingEmail'); return; }
    if (!/^\d{6}$/.test(code)) { this.error.set('verify.errors.invalidCodeFormat'); return; }

    this.loading.set(true);

    this.auth.verifyEmail(email, code).subscribe(
      (res: any) => {
        this.loading.set(false);

        // Cas 1 : vérifiée avec token -> on pose le token et on route par rôle
        if (res?.status === 'verified' && res?.token) {
          // 👉 stocker le token (selon ton AuthService)
          if (this.auth.setToken) {
            this.auth.setToken(res.token);
          } else {
            // fallback si pas de méthode dédiée
            try { localStorage.setItem('auth_token', res.token); } catch {}
          }

          // Nettoie l'email en attente
          try { localStorage.removeItem('bb.emailPending'); } catch {}

          // Récupère l'utilisateur et route comme après un login
          this.loading.set(true);
          this.auth.getCurrentUser().subscribe(
            (user: UserResponse) => {
              this.loading.set(false);
              const role = (user?.role || '').toString().toLowerCase();
              if (role === 'company')      { void this.router.navigate(['/dashboard']); }
              else if (role === 'researcher') { void this.router.navigate(['/dashboard']); }
              else                           { void this.router.navigate(['/home']); }
            },
            () => {
              this.loading.set(false);
              void this.router.navigate(['/home']);
            }
          );
          return;
        }

        // Cas 2 : déjà vérifiée (backend renvoie 'already_verified' sans token)
        if (res?.status === 'already_verified') {
          // pas de token -> on renvoie vers login pour authentification normale
          this.success.set('verify.success');
          void this.router.navigate(['/login'], { queryParams: { email } });
          return;
        }

        // Cas défaut
        this.error.set('verify.errors.invalidOrExpired');
      },
      (err) => {
        this.loading.set(false);
        const status = err?.error?.status || err?.status;
        if (status === 'invalid_or_expired' || err?.status === 400) {
          this.error.set('verify.errors.invalidOrExpired');
        } else {
          this.error.set('verify.errors.invalidCode');
        }
      }
    );
  }

  onResend() {
    const email = (this.email() || '').trim();
    if (!email) { this.error.set('verify.errors.missingEmail'); return; }

    this.loading.set(true);
    this.error.set(null); this.success.set(null);

    this.auth.resendCode(email).subscribe(
      (res: ResendResponse) => {
        this.loading.set(false);
        const sent = !!res?.emailSent;
        this.success.set(sent ? 'verify.resent' : 'verify.resentButMailIssue');
        this.startCooldown(900); // 15 minutes
      },
      () => {
        this.loading.set(false);
        this.error.set('verify.errors.resendFail');
      }
    );
  }

  private startCooldown(seconds: number) {
    this.cooldown.set(seconds);
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      const v = this.cooldown() - 1;
      this.cooldown.set(v);
      if (v <= 0) { clearInterval(this.timerId); this.timerId = null; }
    }, 1000);
  }
}
