import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin-welcome',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './admin-welcome.component.html',
  styleUrls: ['./admin-welcome.component.css'] // 👈 ton fichier CSS ajouté ici

})
export class AdminWelcomeComponent {}
