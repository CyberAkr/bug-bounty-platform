import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@app/core/auth/auth.service';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslateModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, RouterLink
  ],
  templateUrl: './reset-password.component.html',
})
export default class ResetPasswordComponent {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);

  // même regex que register
  readonly PASSWORD_REGEX = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$';

  email    = signal('');
  code     = signal('');
  password = signal('');
  confirm  = signal('');
  loading  = signal(false);
  success  = signal<string | null>(null);
  error    = signal<string | null>(null);

  private regex = new RegExp(this.PASSWORD_REGEX);
  hasMinLength = () => this.password().length >= 8;
  hasLower    = () => /[a-z]/.test(this.password());
  hasUpper    = () => /[A-Z]/.test(this.password());
  hasDigit    = () => /\d/.test(this.password());
  hasSpecial  = () => /[^A-Za-z0-9]/.test(this.password());
  passwordsMatch = () => !!this.confirm().length && this.password() === this.confirm();
  passwordValid  = () => this.regex.test(this.password());

  constructor() {
    const fromQuery = this.route.snapshot.queryParamMap.get('email');
    if (fromQuery) this.email.set(fromQuery);
  }

  onPasswordInput(v: string) {
    this.password.set(v);
  }

  submit() {
    this.success.set(null); this.error.set(null);

    const email = this.email().trim();
    const code  = this.code().trim();
    const pass  = this.password().trim();

    if (!email) { this.error.set('verify.errors.missingEmail'); return; }
    if (!/^\d{6}$/.test(code)) { this.error.set('auth.reset.invalidCode'); return; }
    if (!this.passwordValid()) { this.error.set('auth.register.errors.password.rules'); return; }
    if (!this.passwordsMatch()) { this.error.set('auth.register.errors.confirmPassword'); return; }

    this.loading.set(true);
    this.auth.resetPassword({ email, code, newPassword: pass }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('auth.reset.success');
      },
      error: (err: HttpErrorResponse) => {   // ⬅️ typer err
        this.loading.set(false);
        const status = err?.status;
        if (status === 400) this.error.set('auth.reset.invalidCode');
        else this.error.set('auth.register.error');
      }
    });
  }
}
