import { Injectable, signal, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);
  currentLang = signal<'fr' | 'en'>('fr');

  constructor() {
    const saved = localStorage.getItem('lang');
    const browser = (navigator.language || 'fr').split('-')[0];
    const lang: 'fr' | 'en' = (saved === 'en' || browser === 'en') ? 'en' : 'fr';

    this.translate.addLangs(['fr', 'en']);
    this.translate.setDefaultLang('fr');

    this.translate.use(lang).subscribe({
      next: () => console.log('[i18n] loaded', lang),
      error: (e) => console.error('[i18n] load error', e)
    });

    this.currentLang.set(lang);
  }

  setLanguage(lang: 'fr' | 'en') {
    this.currentLang.set(lang);
    this.translate.use(lang).subscribe({
      next: () => console.log('[i18n] switched to', lang),
      error: (e) => console.error('[i18n] switch error', e)
    });
    localStorage.setItem('lang', lang);
  }
}
