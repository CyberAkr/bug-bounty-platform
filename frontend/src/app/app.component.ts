import {Component, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ThemeService} from '@app/core/theme/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent { private theme = inject(ThemeService);

  constructor() {
    this.theme.apply('theme-cyber'); // Palette C par défaut
    // Exemple pour tester:
    // this.theme.apply('theme-belgium');
  }
}
