import { Component, effect, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule }  from '@angular/material/button';
import { MatIconModule }    from '@angular/material/icon';

import { LanguageSelectorComponent } from '@app/core/i18n/language-selector/language-selector.component';
import { AuthService, AppRole } from '@app/core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, RouterLink, TranslateModule,
    MatToolbarModule, MatButtonModule, MatIconModule,
    LanguageSelectorComponent
  ],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  // UI
  mobileOpen = signal(false);
  toggleMobile = () => this.mobileOpen.update(v => !v);
  closeMobile  = () => this.mobileOpen.set(false);

  // Réactivité auth (exposée par AuthService)
  isLoggedIn = this.auth.isLoggedIn;
  role       = this.auth.role; // computed<AppRole | undefined>

  // Helpers
  isCompany = () => this.role() === 'company';
  isAdmin   = () => this.role() === 'admin';

  // Apparence (ex : switch light/dark via classe body)
  toolbarClass = signal('bg-[var(--color-primary)] text-[var(--on-primary,white)]');

  constructor() {
    // Se (re)connecter visuellement dès que le token change (login/logout/refresh)
    effect(() => {
      const logged = this.isLoggedIn();
      // si besoin d'actions annexes
      // console.log('header loggedIn=', logged, 'role=', this.role());
    });
  }

  async logout() {
    this.auth.logout();
    await this.router.navigate(['/home']);
  }
}
