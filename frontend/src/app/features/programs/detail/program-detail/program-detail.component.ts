import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProgramService } from '@app/features/programs/program.service';
import { AuditProgramResponse } from '@app/models/program.model';
import {ReportSubmitComponent} from '@app/features/reports/submit/report-submit/report-submit.component';
import {ReportStatusComponent} from '@app/features/reports/status/report-status.component';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReportSubmitComponent, ReportStatusComponent],
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
