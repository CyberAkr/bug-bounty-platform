import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '@app/features/users/user.service';
import { UserResponse } from '@app/models/user.model';
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
  verificationDocument: File | null = null;

  ngOnInit(): void {
    this.userService.getMe().subscribe((data) => {
      this.user.set(data);
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.verificationDocument = input.files[0];
    }
  }

  update(): void {
    const current = this.user();
    if (!current) return;

    const formData = new FormData();

    formData.append('firstName', current.firstName);
    formData.append('lastName', current.lastName);
    formData.append('preferredLanguage', current.preferredLanguage);
    formData.append('bio', current.bio || '');

    // Toujours envoyer une valeur, même vide, sinon Spring plante
    formData.append('profilePhoto', current.profilePhoto || '');

    // Si un nouveau document est sélectionné
    if (this.verificationDocument) {
      formData.append('verificationDocument', this.verificationDocument);
    }

    this.userService.updateWithForm(formData).subscribe({
      next: () => alert('✅ Profil mis à jour'),
      error: () => alert('❌ Erreur lors de l’enregistrement')
    });
  }

  delete(): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ?')) return;

    this.userService.delete().subscribe({
      next: () => {
        alert('✅ Compte supprimé');
        this.user.set(null); // Réinitialise le signal
        localStorage.removeItem('auth_token'); // Supprime le token
        window.location.href = '/'; // Redirige proprement
      },
      error: () => alert('❌ Erreur lors de la suppression')
    });
  }
}
