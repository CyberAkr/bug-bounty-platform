import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { StatsComponent } from './components/stats/stats.component';
import { HowItWorksComponent } from './components/how-it-works/how-it-works.component';
import { AdvantagesComponent } from './components/advantages/advantages.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroSectionComponent,
    StatsComponent,
    HowItWorksComponent,
    AdvantagesComponent
  ],
  template: `

    <app-hero-section></app-hero-section>
    <app-stats></app-stats>
    <app-how-it-works></app-how-it-works>
    <app-advantages></app-advantages>
  `,
})
export class HomeComponent {}
