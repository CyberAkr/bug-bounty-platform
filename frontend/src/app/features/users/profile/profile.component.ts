import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '@app/features/users/user.service';
import { UserResponse, UserUpdateRequest } from '@app/models/user.model';
import { ReportService } from '@app/features/reports/report.service';
import { ReportResponse } from '@app/models/report.model';
import { MyReportsComponent } from '@app/features/reports/my-reports/my-reports.component';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, MyReportsComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  user = signal<UserResponse | null>(null);

  ngOnInit(): void {
    this.userService.getMe().subscribe((data) => {
      this.user.set(data);
    });
  }

  update(): void {
    const current = this.user();
    if (!current) return;

    const updatedData: UserUpdateRequest = {
      firstName: current.firstName,
      lastName: current.lastName,
      preferredLanguage: current.preferredLanguage,
      bio: current.bio,
      profilePhoto: current.profilePhoto,
    };

    this.userService.update(updatedData).subscribe(() => {
      alert('✅ Profil mis à jour');
    });
  }

  delete(): void {
    if (!confirm('Supprimer votre compte ?')) return;

    this.userService.delete().subscribe(() => {
      alert('Compte supprimé');
    });
  }
}
