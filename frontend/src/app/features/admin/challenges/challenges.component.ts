
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-challenges',
  standalone: true,
  template: `
    <h1 class="text-2xl font-semibold mb-4">Gestion des défis</h1>
    <div class="bg-white shadow rounded p-4">
      <p>Ici s'affichera la liste des challenges en cours ou passés...</p>
    </div>
  `,
})
export class ChallengesComponent {
  challenges = signal([]);
}
