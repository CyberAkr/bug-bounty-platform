import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../language.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.css'],
})
export class LanguageSelectorComponent {
  lang = inject(LanguageService);

  onChange(event: Event) {
    const value = (event.target as HTMLSelectElement)?.value as 'fr' | 'en';
    if (value === 'fr' || value === 'en') {
      this.lang.setLanguage(value);
    }
  }
}
