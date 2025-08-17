import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgramService } from '../../program.service';

@Component({
  selector: 'app-program-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './program-create.component.html'
})
export class ProgramCreateComponent {
  private programs = inject(ProgramService);

  title = '';
  description = '';
  goal = ''; // purement UI, non envoyé au backend

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  submit(): void {
    const title = this.title.trim();
    const description = this.description.trim();
    if (!title || !description || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    // ⚠️ L'API attend { title, description } (pas "goal")
    this.programs.create({ title, description }).subscribe({
      next: (res) => {
        this.success.set(typeof res === 'string' ? res : (res?.message ?? 'Programme soumis avec succès.'));
        // reset formulaire
        this.title = '';
        this.description = '';
        this.goal = '';
      },
      error: (err) => {
        // 403 si l'utilisateur n'a pas le rôle "company"
        this.error.set(err?.error || 'Échec de la création');
      },
      complete: () => this.loading.set(false),
    });
  }
}
