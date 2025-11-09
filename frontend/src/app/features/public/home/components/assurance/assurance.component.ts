import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-assurance',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatIconModule],
  templateUrl: './assurance.component.html'
})
export class AssuranceComponent {}
