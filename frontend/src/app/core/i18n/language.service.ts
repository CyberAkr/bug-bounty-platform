import { Injectable, signal, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);
  currentLang = signal<'fr' | 'en'>('fr');

  constructor() {
    const saved = localStorage.getItem('lang');
    const browserLang = navigator.language.split('-')[0];
    const lang = (saved === 'en' || browserLang === 'en') ? 'en' : 'fr';

    this.currentLang.set(lang as 'fr' | 'en');
    this.translate.addLangs(['fr', 'en']);
    this.translate.setDefaultLang('fr');
    this.translate.use(lang as 'fr' | 'en');
    this.translate.addLangs(['fr', 'en']);
    this.translate.setDefaultLang('fr');
    this.translate.use(lang as 'fr'|'en').subscribe({
      next: () => console.log('[i18n] loaded', lang),
      error: e => console.error('[i18n] load error', e)
    });

  }

  setLanguage(lang: 'fr' | 'en') {
    this.currentLang.set(lang);
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }
}
