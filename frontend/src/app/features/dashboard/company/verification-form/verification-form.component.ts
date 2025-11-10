import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-verification-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    TranslatePipe
  ],
  templateUrl: './verification-form.component.html'
})
export class VerificationFormComponent {
  private http = inject(HttpClient);

  companyNumber = '';
  document: File | null = null;

  // On stocke des clés i18n (et non des strings traduites) pour rester cohérent avec les pipes
  successKey = signal<string | null>(null);
  errorKey = signal<string | null>(null);
  // Erreur brute renvoyée par l'API (non traduite)
  errorText = signal<string | null>(null);

  isSubmitting = signal(false);

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    const MAX = 20 * 1024 * 1024; // 20MB
    if (file.type !== 'application/pdf') {
      this.errorKey.set('company.verify.errors.onlyPdf');
      this.errorText.set(null);
      this.successKey.set(null);
      this.document = null;
      return;
    }
    if (file.size > MAX) {
      this.errorKey.set('company.verify.errors.tooLarge');
      this.errorText.set(null);
      this.successKey.set(null);
      this.document = null;
      return;
    }

    this.errorKey.set(null);
    this.errorText.set(null);
    this.document = file;
  }

  submit(): void {
    if (!this.companyNumber || !this.document) {
      this.errorKey.set('company.verify.errors.required');
      this.errorText.set(null);
      this.successKey.set(null);
      return;
    }

    const formData = new FormData();
    formData.append('companyNumber', this.companyNumber);
    formData.append('verificationDocument', this.document);

    this.isSubmitting.set(true);
    this.successKey.set(null);
    this.errorKey.set(null);
    this.errorText.set(null);

    this.http.post('/api/users/verification-document', formData).subscribe({
      next: () => {
        this.successKey.set('company.verify.success');
        this.errorKey.set(null);
        this.errorText.set(null);
        this.isSubmitting.set(false);
      },
      error: (e) => {
        const msg = e?.error?.error || e?.error;
        if (msg && typeof msg === 'string') {
          // Message API lisible tel quel
          this.errorText.set(msg);
          this.errorKey.set(null);
        } else {
          // Fallback i18n générique
          this.errorKey.set('company.verify.errors.submitFailed');
          this.errorText.set(null);
        }
        this.successKey.set(null);
        this.isSubmitting.set(false);
      }
    });
  }
}
