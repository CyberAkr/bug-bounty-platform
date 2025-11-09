import { Injectable, signal } from '@angular/core';

export type ThemeName = 'theme-cyber' | 'theme-belgium' | 'theme-blue-pro' | 'theme-warm';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  current = signal<ThemeName>('theme-cyber');

  apply(theme: ThemeName) {
    // retire toutes les classes de thème possibles
    document.body.classList.remove('theme-cyber','theme-belgium','theme-blue-pro','theme-warm');
    // applique celle demandée
    document.body.classList.add(theme);
    // met à jour le signal
    this.current.set(theme);
  }
}
