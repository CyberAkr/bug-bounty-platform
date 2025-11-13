import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-legal-privacy',
  standalone: true,
  imports: [CommonModule, MatCardModule, TranslateModule],
  templateUrl: './privacy.component.html'
})
export class PrivacyComponent {}
