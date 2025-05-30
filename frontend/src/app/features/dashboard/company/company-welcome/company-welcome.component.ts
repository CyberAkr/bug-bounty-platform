import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '@app/features/users/user.service';
import { UserResponse } from '@app/models/user.model';

@Component({
  selector: 'app-company-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './company-welcome.component.html'
})
export class CompanyWelcomeComponent {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  private readonly verificationStatus = signal<'PENDING' | 'REJECTED' | 'APPROVED'>('PENDING');

  get isApproved(): boolean {
    return this.verificationStatus() === 'APPROVED';
  }

  constructor() {
    this.userService.getMe().subscribe((user: UserResponse) => {
      this.verificationStatus.set(user.verificationStatus as any);
    });
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  createProgram() {
    if (this.isApproved) {
      this.router.navigate(['/programs/create']);
    }
  }
}
