import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-report-guide',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    TranslatePipe
  ],
  templateUrl: './report-guide.component.html'
})
export class ReportGuideComponent {}
