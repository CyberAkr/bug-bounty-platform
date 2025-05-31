
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-rewards',
  standalone: true,
  template: `
    <h1 class="text-2xl font-semibold mb-4">Gestion des récompenses</h1>
    <div class="bg-white shadow rounded p-4">
      <p>Ici s'affichera la liste des récompenses versées...</p>
    </div>
  `,
})
export class RewardsComponent {
  rewards = signal([]);
}

