import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-program-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './program-create.component.html'
})
export class ProgramCreateComponent {
  title = '';
  description = '';
  goal = '';

  submit(): void {
    console.log('🆕 Programme à créer :', {
      title: this.title,
      description: this.description,
      goal: this.goal
    });

    // TODO: appeler programService.create(...)
    alert('Programme soumis !');
  }
}
