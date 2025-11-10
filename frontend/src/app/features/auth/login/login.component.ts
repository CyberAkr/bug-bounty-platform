import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '@app/core/auth/auth.service';
import { UserResponse } from '@app/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslateModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, RouterLink
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  loading = signal(false);
  errorMsg = signal<string | null>(null);
  submitAttempted = signal(false);

  // disabled si loading ou champs vides
  canSubmit = computed(
    () =>
      !this.loading() &&
      this.email().trim().length > 0 &&
      this.password().trim().length > 0
  );

  login(form: NgForm) {
    this.submitAttempted.set(true);
    this.errorMsg.set(null);

    if (form.invalid) return;

    this.loading.set(true);

    const email = this.email().trim();
    const password = this.password().trim();

    this.auth.login(email, password).subscribe(
      () => {
        // login OK → récupérer le profil et router en fonction du rôle
        this.auth.getCurrentUser().subscribe(
          (user: UserResponse) => {
            const role = (user?.role || '').toString().toLowerCase();
            if (role === 'company') {
              void this.router.navigate(['/dashboard']);
            } else if (role === 'researcher') {
              void this.router.navigate(['/dashboard']);
            } else {
              void this.router.navigate(['/home']);
            }
            this.loading.set(false);
          },
          () => {
            this.loading.set(false);
            void this.router.navigate(['/home']);
          }
        );
      },
      (err) => {
        this.loading.set(false);

        // ----- redirection auto vers vérification si email non vérifié -----
        const status = err?.status;
        const body = err?.error;
        const bodyText =
          typeof body === 'string' ? body : (body?.message || '');

        const isUnverifiedByText =
          status === 403 && /email non vérifié/i.test(bodyText || '');
        const isUnverifiedByJson =
          status === 403 && (body?.status === 'unverified');

        if (isUnverifiedByText || isUnverifiedByJson) {
          const targetEmail = body?.email || email;
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem('bb.emailPending', targetEmail);
            }
          } catch {}
          void this.router.navigate(['/verify-email'], {
            queryParams: { email: targetEmail },
          });
          return;
        }
        // -------------------------------------------------------------------

        this.errorMsg.set('auth.errors.invalid');
      }
    );
  }
}
