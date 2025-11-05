import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  role = signal<'company' | 'researcher'>('researcher');

  // Champs communs
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  username = '';
  preferredLanguage = 'fr';
  bio = '';

  // Spécifique entreprise
  companyNumber = '';

  // Feedback
  errorMessage = '';
  successMessage = '';

  register(): void {
    const payload: any = {
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      username: this.username,
      bio: this.bio,
      preferredLanguage: this.preferredLanguage,
      role: this.role()
    };

    if (this.role() === 'company') {
      payload.companyNumber = this.companyNumber;
    }

    this.authService.register(payload).subscribe({
      next: (res) => {
        // Succès normal
        this.successMessage = 'Inscription réussie ! Vérifiez votre email.';
        this.errorMessage = '';
        this.router.navigate(['/verify-email'], { queryParams: { email: this.email } });
      },
      error: (err) => {
        // 409: email déjà utilisé
        if (err?.status === 409) {
          this.successMessage = '';
          this.errorMessage = err?.error?.message || 'Cet email est déjà utilisé.';
          return;
        }

        // Cas réseau/5xx: le user peut être créé mais l’email a échoué → on envoie vers la vérif
        if (err?.status === 0 || (err?.status >= 500 && err?.status < 600)) {
          this.errorMessage = 'Problème d’envoi de mail. Entrez le code ou renvoyez-le.';
          this.successMessage = 'Inscription enregistrée. Vérifiez votre email.';
          this.router.navigate(['/verify-email'], { queryParams: { email: this.email } });
          return;
        }

        // Autres erreurs
        this.successMessage = '';
        this.errorMessage =
          (typeof err?.error === 'string' && err.error) ||
          err?.error?.message ||
          "Erreur lors de l'inscription.";
      }
    });
  }
}
