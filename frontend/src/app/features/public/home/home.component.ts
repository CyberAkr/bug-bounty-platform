import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { AdvantagesComponent } from './components/advantages/advantages.component';
import { HowItWorksComponent } from './components/how-it-works/how-it-works.component';
import { AssuranceComponent } from './components/assurance/assurance.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroSectionComponent,
    AdvantagesComponent,
    HowItWorksComponent,
    AssuranceComponent
  ],
  template: `
    <app-hero-section></app-hero-section>
    <app-advantages></app-advantages>
    <app-how-it-works></app-how-it-works>
    <app-assurance></app-assurance>
  `
})
export class HomeComponent {}
