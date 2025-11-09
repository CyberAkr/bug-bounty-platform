import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatButtonModule }     from '@angular/material/button';
import { MatIconModule }       from '@angular/material/icon';

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

  // état via signaux
  email   = signal('');
  password = signal('');
  loading  = signal(false);
  errorMsg = signal<string | null>(null);
  submitAttempted = signal(false);

  // bouton disabled si en cours / champs vides
  canSubmit = computed(() =>
    !this.loading() && this.email().trim().length > 0 && this.password().trim().length > 0
  );

  login(form: NgForm) {
    this.submitAttempted.set(true);
    this.errorMsg.set(null);

    if (form.invalid) return;

    this.loading.set(true);
    this.auth.login(this.email(), this.password()).subscribe({
      next: () => {
        this.auth.getCurrentUser().subscribe({
          next: (user: UserResponse) => {
            const role = (user?.role || '').toString().toLowerCase();
            if (role === 'company')      this.router.navigate(['/company']);
            else if (role === 'researcher') this.router.navigate(['/dashboard']);
            else                          this.router.navigate(['/home']);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
            this.router.navigate(['/home']);
          }
        });
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('auth.errors.invalid');
      }
    });
  }
}
