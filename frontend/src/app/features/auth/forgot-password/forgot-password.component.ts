import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@app/core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslateModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, RouterLink
  ],
  templateUrl: './forgot-password.component.html',
})
export default class ForgotPasswordComponent {
  private auth = inject(AuthService);

  email   = signal('');
  loading = signal(false);
  success = signal<string | null>(null);
  error   = signal<string | null>(null);

  submit() {
    this.success.set(null); this.error.set(null);
    const v = this.email().trim();
    if (!v) { this.error.set('verify.errors.missingEmail'); return; }

    this.loading.set(true);
    this.auth.requestPasswordReset(v).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('auth.reset.requestSent'); // message neutre: si compte existe
      },
      error: (_err: HttpErrorResponse) => {
        this.loading.set(false);
        // Réponse neutre (anti user-enumeration)
        this.success.set('auth.reset.requestSent');
      }
    });
  }
}
