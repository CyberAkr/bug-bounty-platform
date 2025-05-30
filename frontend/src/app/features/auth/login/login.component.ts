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
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.authService.getCurrentUser().subscribe({
          next: (user: UserResponse) => {
            const role = user.role;
            if (role === 'company') {
              this.router.navigate(['/company']);
            } else if (role === 'researcher') {
              this.router.navigate(['/dashboard']);
            } else {
              this.router.navigate(['/home']);
            }
          },
          error: () => this.router.navigate(['/home'])
        });
      },
      error: () => this.errorMessage = 'Identifiants invalides.'
    });
  }
}
