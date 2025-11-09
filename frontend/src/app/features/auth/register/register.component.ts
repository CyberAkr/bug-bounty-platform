import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatSelectModule }     from '@angular/material/select';
import { MatButtonModule }     from '@angular/material/button';
import { MatIconModule }       from '@angular/material/icon';

import { AuthService } from '@app/core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslateModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, RouterLink
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  // état
  role = signal<'company' | 'researcher'>('researcher');
  email = signal(''); password = signal('');
  firstName = signal(''); lastName = signal('');
  username = signal(''); preferredLanguage = signal<'fr'|'en'>('fr');
  bio = signal(''); companyNumber = signal('');
  loading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  submitAttempted = signal(false);

  canSubmit = computed(() =>
    !this.loading()
    && !!this.email().trim()
    && !!this.password().trim()
    && !!this.firstName().trim()
    && !!this.lastName().trim()
    && !!this.username().trim()
    && (this.role() !== 'company' || !!this.companyNumber().trim())
  );

  switchRole(next: 'company'|'researcher') {
    this.role.set(next);
  }

  register(f: NgForm) {
    this.submitAttempted.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);
    if (f.invalid || !this.canSubmit()) return;

    const payload: any = {
      email: this.email(),
      password: this.password(),
      firstName: this.firstName(),
      lastName: this.lastName(),
      username: this.username(),
      bio: this.bio(),
      preferredLanguage: this.preferredLanguage(),
      role: this.role()
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
