import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-section.component.html',
})
export class HeroSectionComponent {
  private router = inject(Router);

  goToRegister(role: 'company' | 'researcher') {
    this.router.navigate(['/register'], { queryParams: { role } });
  }
}
