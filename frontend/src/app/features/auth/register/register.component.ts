import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@app/core/auth/auth.service';
import {MatCheckboxRequiredValidator} from '@angular/material/checkbox';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslateModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, RouterLink, MatCheckboxRequiredValidator
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  // Règle MDP : min 8, 1 minuscule, 1 majuscule, 1 chiffre, 1 spécial
  readonly PASSWORD_REGEX = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$';

  // état
  role = signal<'company' | 'researcher'>('researcher');
  email = signal(''); password = signal(''); confirmPassword = signal('');
  firstName = signal(''); lastName = signal('');
  username = signal(''); preferredLanguage = signal<'fr'|'en'>('fr');
  bio = signal(''); companyNumber = signal('');
  loading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  submitAttempted = signal(false);

  // acceptation légale obligatoire
  acceptLegal = signal(false);

  // Helpers MDP
  private regex = new RegExp(this.PASSWORD_REGEX);
  hasMinLength = () => this.password().length >= 8;
  hasLower    = () => /[a-z]/.test(this.password());
  hasUpper    = () => /[A-Z]/.test(this.password());
  hasDigit    = () => /\d/.test(this.password());
  hasSpecial  = () => /[^A-Za-z0-9]/.test(this.password());
  passwordsMatch = () => !!this.confirmPassword().length && this.password() === this.confirmPassword();
  passwordValid  = () => this.regex.test(this.password());

  onPasswordInput(value: string) {
    this.password.set(value);
  }

  canSubmit = computed(() =>
    !this.loading()
    && !!this.email().trim()
    && !!this.password().trim()
    && !!this.firstName().trim()
    && !!this.lastName().trim()
    && !!this.username().trim()
    && this.passwordValid()
    && this.passwordsMatch()
    && (this.role() !== 'company' || !!this.companyNumber().trim())
    && this.acceptLegal() // ⬅️ bloque le bouton si non accepté
  );

  switchRole(next: 'company'|'researcher') {
    this.role.set(next);
  }

  register(f: NgForm) {
    this.submitAttempted.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);

    // Garde-front
    if (!this.passwordValid()) {
      this.errorMsg.set('auth.register.errors.password.rules');
      return;
    }
    if (!this.passwordsMatch()) {
      this.errorMsg.set('auth.register.errors.confirmPassword');
      return;
    }
    if (!this.acceptLegal()) {
      this.errorMsg.set('auth.register.errors.acceptLegal');
      return;
    }
    if (f.invalid || !this.canSubmit()) return;

    const payload: any = {
      email: this.email(),
      password: this.password(),
      firstName: this.firstName(),
      lastName: this.lastName(),
      username: this.username(),
      bio: this.bio(),
      preferredLanguage: this.preferredLanguage(),
      role: this.role(),
      // acceptLegal: this.acceptLegal() // ⬅️ optionnel si tu veux le journaliser côté back
    };
    if (this.role() === 'company') payload.companyNumber = this.companyNumber();

    this.loading.set(true);
    this.auth.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('auth.register.success');
        this.router.navigate(['/verify-email'], { queryParams: { email: this.email() } });
      },
      error: (err) => {
        this.loading.set(false);

        if (err?.status === 400 && (err?.error?.message || err?.error?.errors)) {
          const first = Array.isArray(err.error.errors) ? err.error.errors[0] : null;
          this.errorMsg.set(first?.message || err.error.message || 'auth.register.error');
          return;
        }
        if (err?.status === 409) {
          this.errorMsg.set(err?.error?.message || 'auth.register.emailInUse');
          return;
        }
        if (err?.status === 0 || (err?.status >= 500 && err?.status < 600)) {
          this.successMsg.set('auth.register.savedButEmailIssue');
          this.router.navigate(['/verify-email'], { queryParams: { email: this.email() } });
          return;
        }
        this.errorMsg.set(
          (typeof err?.error === 'string' && err.error) ||
          err?.error?.message ||
          'auth.register.error'
        );
      }
    });
  }
}
