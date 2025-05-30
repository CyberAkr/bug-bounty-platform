import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.component.html',
})
export class StatsComponent {
  programs = signal(14);
  researchers = signal(62);
  rewards = signal(3200); // €
}
