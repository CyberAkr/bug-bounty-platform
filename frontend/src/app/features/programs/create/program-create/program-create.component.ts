import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgramService } from '@app/features/programs/program.service';
import { AuditProgramRequest } from '@app/models/program.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-program-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './program-create.component.html',
})
export class ProgramCreateComponent {
  private programService = inject(ProgramService);
  private router = inject(Router);

  title = '';
  description = '';

  submit(): void {
    const newProgram: AuditProgramRequest = {
      title: this.title,
      description: this.description,
    };

    this.programService.create(newProgram).subscribe(() => {
      alert('✅ Programme créé avec succès !');
      this.router.navigate(['/programs']);
    });
  }
}
