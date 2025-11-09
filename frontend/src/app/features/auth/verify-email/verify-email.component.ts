import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatButtonModule }     from '@angular/material/button';
import { MatIconModule }       from '@angular/material/icon';

import { AuthService } from '@app/core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-verify-email',
  imports: [
    CommonModule, FormsModule, TranslateModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule
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

  constructor() {
    const fromQuery = this.route.snapshot.queryParamMap.get('email');
    const fromState = this.auth.emailPendingVerification?.();
    this.email.set(fromQuery || fromState || '');
  }

  onSubmit(f: NgForm) {
    if (f.invalid || !this.email()) {
      this.error.set('verify.errors.missingEmail');
      return;
    }
    this.loading.set(true);
    this.error.set(null); this.success.set(null);

    this.auth.verifyEmail(this.email(), this.code()).subscribe({
      next: (res) => {
        if (res?.status === 'verified') {
          this.success.set('verify.success');
          this.loading.set(false);
          this.router.navigate(['/login']);
        } else {
          this.error.set('verify.errors.invalidCode');
          this.loading.set(false);
        }
      },
      error: () => {
        this.error.set('verify.errors.invalidCode');
        this.loading.set(false);
      }
    });
  }

  onResend() {
    if (!this.email()) {
      this.error.set('verify.errors.missingEmail');
      return;
    }
    this.loading.set(true);
    this.error.set(null); this.success.set(null);

    this.auth.resendCode(this.email()).subscribe({
      next: () => {
        this.success.set('verify.resent');
        this.loading.set(false);
      },
      error: () => {
        this.error.set('verify.errors.resendFail');
        this.loading.set(false);
      }
    });
  }
}
