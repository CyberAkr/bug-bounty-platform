import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@app/core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private auth = inject(AuthService);

  get isLoggedIn(): boolean {
    return !!this.auth.getToken();
  }

  logout(): void {
    this.auth.logout();
  }
}
