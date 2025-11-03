import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '@app/core/auth/auth.service';
import { LanguageService } from '@app/core/i18n/language.service';
import { LanguageSelectorComponent } from '@app/core/i18n/language-selector/language-selector.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule }  from '@angular/material/button';
import { MatIconModule }    from '@angular/material/icon';

type Role = 'admin' | 'company' | 'user' | undefined;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, RouterLink, TranslateModule,
    MatToolbarModule, MatButtonModule, MatIconModule,
    LanguageSelectorComponent
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  lang = inject(LanguageService);

  // on garde un signal pour réagir au changement de token si besoin
  private token = signal<string | null>(null);

  ngOnInit() {
    // récupère le token au chargement
    this.token.set(this.auth.getToken?.() ?? null);

    // si ton AuthService expose un event/subject pour le login/logout, abonne-toi ici
    // ex: this.auth.tokenChanges$.subscribe(t => this.token.set(t));
    console.log('✅ HeaderComponent chargé');
  }

  get isLoggedIn() { return !!this.token(); }

  // --- helpers JWT pour lire le rôle sans dépendre d’un modèle précis ---
  private decodeRoleFromToken(): Role {
    const t = this.token();
    if (!t) return undefined;
    try {
      const payload = JSON.parse(atob(t.split('.')[1] ?? ''));
      // cas les plus courants selon backend:
      //  - Spring Security: "roles" ou "authorities"
      //  - custom: "role"
      const roles: string[] =
        payload?.roles ??
        payload?.authorities ??
        (payload?.role ? [payload.role] : []);
      if (!Array.isArray(roles)) return undefined;

      if (roles.includes('ROLE_ADMIN') || roles.includes('admin')) return 'admin';
      if (roles.includes('ROLE_COMPANY') || roles.includes('company')) return 'company';
      return 'user';
    } catch {
      return undefined;
    }
  }

  // on expose des computed pour le template
  private role = computed<Role>(() => this.decodeRoleFromToken());

  isCompany() { return this.role() === 'company'; }
  isAdmin()   { return this.role() === 'admin'; }

  logout() {
    this.auth.logout?.();
    this.token.set(null);
    void this.router.navigate(['/home']);
  }
}
