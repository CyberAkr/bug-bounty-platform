import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '@app/core/auth/auth.service';
import { UserResponse } from '@app/models/user.model';
import { LanguageService } from '@app/core/i18n/language.service';
import { LanguageSelectorComponent } from '@app/core/i18n/language-selector/language-selector.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, LanguageSelectorComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  lang = inject(LanguageService);
  user = signal<UserResponse | null>(null);

  ngOnInit() {
    console.log('✅ HeaderComponent chargé');
  }

  get isLoggedIn() { return !!this.auth.getToken(); }
  isCompany() { return this.user()?.role === 'company'; }
  isAdmin() { return this.user()?.role === 'admin'; }

  logout() {
    this.auth.logout();
    void this.router.navigate(['/home']);
  }
}
