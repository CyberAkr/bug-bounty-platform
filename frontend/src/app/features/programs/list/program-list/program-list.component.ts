import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { TranslateModule } from '@ngx-translate/core';

import { ProgramService } from '@app/features/programs/program.service';
import { AuditProgramResponse } from '@app/models/program.model';
import { StatusColorPipe } from '@app/shared/pipes/status-color.pipe';

@Component({
  selector: 'app-program-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule,
    MatCardModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule, MatChipsModule,
    StatusColorPipe
  ],
  templateUrl: './program-list.component.html'
})
export class ProgramListComponent implements OnInit {
  private svc = inject(ProgramService);

  programs = signal<AuditProgramResponse[]>([]);
  loading  = signal(true);

  // visible = first 15 (3 cols x 5 rows)
  visiblePrograms = computed(() => (this.programs().slice(0, 15)));

  ngOnInit(): void { this.fetch(); }

  private fetch() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (data) => { this.programs.set(data ?? []); this.loading.set(false); },
      error: () => { this.programs.set([]); this.loading.set(false); }
    });
  }

  trackId = (_: number, p: AuditProgramResponse) => p.id;
}
