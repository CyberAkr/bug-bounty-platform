import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './stats.component.html'
})
export class StatsComponent {
  programs = signal(14);
  researchers = signal(62);
  rewards = signal(3200);
}
