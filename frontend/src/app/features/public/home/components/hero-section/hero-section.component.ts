import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MatButtonModule, MatIconModule],
  templateUrl: './hero-section.component.html'
})
export class HeroSectionComponent {
  private router = inject(Router);
  goToRegister(role: 'company' | 'researcher') {
    this.router.navigate(['/register'], { queryParams: { role } });
  }
}
