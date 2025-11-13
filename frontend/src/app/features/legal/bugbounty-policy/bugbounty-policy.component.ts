import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-legal-bugbounty-policy',
  standalone: true,
  imports: [CommonModule, MatCardModule, TranslateModule],
  templateUrl: './bugbounty-policy.component.html'
})
export class BugBountyPolicyComponent {}
