import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/core/auth/auth.service';
import { UserResponse } from '@app/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  user = signal<UserResponse | null>(null);

  ngOnInit(): void {
    if (this.isLoggedIn) {
      this.auth.getCurrentUser().subscribe({
        next: (u) => this.user.set(u),
        error: () => this.user.set(null),
      });
    }
  }

  get isLoggedIn(): boolean {
    return !!this.auth.getToken();
  }

  isCompany(): boolean {
    return this.user()?.role === 'company';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/home']);
  }
}
