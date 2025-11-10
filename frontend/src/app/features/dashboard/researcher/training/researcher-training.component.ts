import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-researcher-training',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatListModule, TranslatePipe],
  templateUrl: './researcher-training.component.html'
})
export class ResearcherTrainingComponent {
  // signal contenant les plateformes (clé i18n + lien)
  readonly platforms = signal([
    { label: 'researcher.training.platforms.tryhackme', href: 'https://tryhackme.com', desc: 'researcher.training.platforms.tryhackmeDesc' },
    { label: 'researcher.training.platforms.hackthebox', href: 'https://www.hackthebox.com', desc: 'researcher.training.platforms.hacktheboxDesc' },
    { label: 'researcher.training.platforms.portswigger', href: 'https://portswigger.net/web-security', desc: 'researcher.training.platforms.portswiggerDesc' }
  ]);
}
