import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/auth/auth.service';
import { UserResponse } from '@app/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        // micro-délai pour que le token soit bien intercepté avant l'appel
        setTimeout(() => {
          this.authService.getCurrentUser().subscribe({
            next: (user: UserResponse) => this.redirectUserByRole(user.role),
            error: () => {
              this.errorMessage = 'Impossible de charger votre profil.';
              this.router.navigate(['/']);
            }
          });
        });
      },
      error: () => {
        this.errorMessage = 'Identifiants invalides.';
      }
    });
  }

  private redirectUserByRole(role: string | undefined | null) {
    const path = {
      company: '/company',
      researcher: '/researcher',
      admin: '/admin'
    }[role?.toLowerCase() ?? ''] || '/';

    console.log('🔁 Redirection vers :', path);
    this.router.navigate([path]);
  }
}
