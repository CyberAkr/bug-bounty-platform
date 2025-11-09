import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-advantages',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatIconModule],
  templateUrl: './advantages.component.html'
})
export class AdvantagesComponent {}
