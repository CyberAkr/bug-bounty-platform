import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { UserService } from '@app/features/users/user.service';
import { UserResponse } from '@app/models/user.model';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-company-welcome',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    TranslatePipe
  ],
  templateUrl: './company-welcome.component.html'
})
export class CompanyWelcomeComponent {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  private readonly verificationStatus = signal<'PENDING' | 'REJECTED' | 'APPROVED'>('PENDING');
  readonly isApproved = computed(() => this.verificationStatus() === 'APPROVED');

  constructor() {
    this.userService.getMe().subscribe((user: UserResponse) => {
      this.verificationStatus.set(user.verificationStatus as any);
    });
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  createProgram(): void {
    if (this.isApproved()) {
      this.router.navigate(['/programs/create']);
    }
  }
}
