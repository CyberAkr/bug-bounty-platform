import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verification-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verification-form.component.html'
})
export class VerificationFormComponent {
  companyNumber = '';
  document: File | null = null;
  successMessage = '';
  errorMessage = '';

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      this.document = file;
    }
  }

  submit() {
    if (!this.companyNumber || !this.document) {
      this.errorMessage = 'Tous les champs sont requis.';
      return;
    }

    const formData = new FormData();
    formData.append('companyNumber', this.companyNumber);
    formData.append('verificationDocument', this.document);

    // TODO: Appel vers un futur VerificationService
    console.log('📤 Envoi des données de vérification...', formData);

    this.successMessage = 'Document envoyé. Vérification en cours.';
    this.errorMessage = '';
  }
}
