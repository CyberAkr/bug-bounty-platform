import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProgramService } from '@app/features/programs/program.service';
import { AuditProgramResponse } from '@app/models/program.model';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './program-detail.component.html',
})
export class ProgramDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private programService = inject(ProgramService);
  program?: AuditProgramResponse;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.programService.getOne(id).subscribe((data) => {
      this.program = data;
    });
  }
}
