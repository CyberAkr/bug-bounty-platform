import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProgramService } from '@app/features/programs/program.service';
import { AuditProgramResponse } from '@app/models/program.model';
import {StatusColorPipe} from '@app/shared/pipes/status-color.pipe';

@Component({
  selector: 'app-program-list',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusColorPipe],
  templateUrl: './program-list.component.html',
})
export class ProgramListComponent implements OnInit {
  private programService = inject(ProgramService);
  programs = signal<AuditProgramResponse[]>([]);

  ngOnInit(): void {
    this.programService.getAll().subscribe((data) => {
      this.programs.set(data);
    });
  }
}
