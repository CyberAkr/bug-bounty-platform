import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/auth/auth.service';

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
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        const role = this.authService.currentRole();
        const redirectPath = role === 'company'
            ? '/company'
            : role === 'researcher'
                ? '/dashboard'
                : '/home';

        // ✅ Délai minimum pour laisser Angular charger le layout
        setTimeout(() => {
          this.router.navigateByUrl(redirectPath, { replaceUrl: true });
        }, 0);
      },
      error: () => this.errorMessage = 'Identifiants invalides.'
    });
  }
}
