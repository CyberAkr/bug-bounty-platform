import { Component } from '@angular/core';
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
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {
  }

  register() {
    this.authService.register({
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName
    }).subscribe({
      next: (res: any) => {
        console.log('✅ Succès :', res);
        this.successMessage = typeof res === 'string' ? res : res?.message || "Inscription réussie.";
        this.errorMessage = '';
        // Optionnel : redirection après succès
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        console.error('❌ Erreur reçue :', err);
        this.successMessage = '';
        if (typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = "Erreur lors de l'inscription.";
        }
      }
    });
  }
}
