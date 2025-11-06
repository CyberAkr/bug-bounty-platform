import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verification-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verification-form.component.html'
})
export class VerificationFormComponent {
  private http = inject(HttpClient);

  companyNumber = '';
  document: File | null = null;

  successMessage = signal('');
  errorMessage = signal('');

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    const MAX = 20 * 1024 * 1024; // 20MB (aligne avec le back)
    if (file.type !== 'application/pdf') {
      this.errorMessage.set('Seuls les PDF sont acceptés.');
      return;
    }
    if (file.size > MAX) {
      this.errorMessage.set('Fichier trop volumineux (>20MB).');
      return;
    }

    this.errorMessage.set('');
    this.document = file;
  }

  submit() {
    if (!this.companyNumber || !this.document) {
      this.errorMessage.set('Tous les champs sont requis.');
      return;
    }

    const formData = new FormData();
    formData.append('companyNumber', this.companyNumber);
    formData.append('verificationDocument', this.document);

    // Flux dédié (simple)
    this.http.post('/api/users/verification-document', formData).subscribe({
      next: () => {
        this.successMessage.set('Document envoyé. Vérification en cours.');
        this.errorMessage.set('');
      },
      error: (e) => {
        const msg = e?.error?.error || e?.error || 'Échec de l’envoi';
        this.errorMessage.set(msg);
        this.successMessage.set('');
      }
    });
  }
}
