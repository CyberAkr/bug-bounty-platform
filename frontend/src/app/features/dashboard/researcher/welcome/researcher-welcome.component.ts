import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-researcher-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './researcher-welcome.component.html'
})
export class researcherWelcomeComponent {}
