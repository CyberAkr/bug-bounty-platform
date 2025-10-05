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
  loading = signal(false);
  error = signal<string | null>(null);
  goal: any;


  publish(): void {
    const title = this.title.trim();
    const description = this.description.trim();
    if (!title || !description || this.loading()) return;


    this.loading.set(true);
    this.error.set(null);


    this.programs.checkoutBeforeCreate(title, description).subscribe({
      next: (res) => {
        if (res?.url) {
          window.location.href = res.url;
        } else {
          this.error.set('Pas de redirection Stripe.');
          this.loading.set(false);
        }
      },
      error: (err) => {
        this.error.set(err?.error || 'Erreur lors de la redirection vers Stripe.');
        this.loading.set(false);
      }
    });
  }
}
