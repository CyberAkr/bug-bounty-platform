import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-legal-mentions',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule,
    MatCardModule, MatButtonModule, MatIconModule
  ],
  templateUrl: './legal-mentions.component.html'
})
export class LegalMentionsComponent {}
