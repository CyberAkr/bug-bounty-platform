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
      next: () => {
        this.successMessage = 'Inscription réussie !';
        this.errorMessage = '';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.successMessage = '';
        this.errorMessage = err?.error?.message || "Erreur lors de l'inscription.";
      }
    });
  }
}
