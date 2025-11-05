import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UploadPhotoResponse } from '@app/features/users/user.service';
import { UserResponse } from '@app/models/user.model';
import { MyReportsComponent } from '@app/features/reports/my-reports/my-reports.component';
import { HttpErrorResponse } from '@angular/common/http';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MyReportsComponent,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDividerModule, MatTooltipModule
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);

  user = signal<UserResponse | null>(null);

  // Entreprise
  verificationDocument: File | null = null;

  // Photo
  photoFile: File | null = null;
  photoPreviewUrl = signal<string | null>(null);

  /** 🔧 À supprimer si tu configures le proxy /files */
  private backendBase = 'http://localhost:8080';

  ngOnInit(): void {
    this.userService.getMe().subscribe((data) => this.user.set(data));
  }
  ngOnDestroy(): void { this.revokePreview(); }

  // ====== Update texte ======
  update(): void {
    const current = this.user();
    if (!current) return;

    const formData = new FormData();
    formData.append('firstName', current.firstName);
    formData.append('lastName', current.lastName);
    formData.append('preferredLanguage', current.preferredLanguage);
    formData.append('bio', current.bio || '');
    formData.append('profilePhoto', current.profilePhoto || '');

    if (this.verificationDocument) {
      formData.append('verificationDocument', this.verificationDocument);
    }

    this.userService.updateWithForm(formData).subscribe({
      next: () => alert('✅ Profil mis à jour'),
      error: () => alert('❌ Erreur lors de l’enregistrement'),
    });
  }

  delete(): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ?')) return;
    this.userService.delete().subscribe({
      next: () => {
        alert('✅ Compte supprimé');
        this.user.set(null);
        localStorage.removeItem('auth_token');
        window.location.href = '/';
      },
      error: () => alert('❌ Erreur lors de la suppression'),
    });
  }

  // ====== Entreprise ======
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) this.verificationDocument = input.files[0];
  }

  // ====== Photo ======
  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input?.files?.length) return;
    this.photoFile = input.files[0];

    this.revokePreview();
    const url = URL.createObjectURL(this.photoFile);
    this.photoPreviewUrl.set(url);
  }

  uploadPhoto(): void {
    if (!this.photoFile) { alert("Sélectionne une image d'abord."); return; }

    this.userService.uploadPhoto(this.photoFile).subscribe({
      next: (res: UploadPhotoResponse) => {
        const u = this.user();
        if (u) this.user.set({ ...u, profilePhoto: res.profilePhoto });
        this.revokePreview();
        this.photoFile = null;
        alert('🖼️ Photo mise à jour');
      },
      error: (err: HttpErrorResponse) => {
        const msg = (err.error && (err.error.error || err.error.message)) || err.message || 'Échec de l’upload';
        alert('❌ ' + msg);
      },
    });
  }

  // Résout /files/... en URL absolue si pas de proxy
  resolvePhotoUrl(path?: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${this.backendBase}${path}`;
  }

  private revokePreview() {
    const current = this.photoPreviewUrl();
    if (current) URL.revokeObjectURL(current);
    this.photoPreviewUrl.set(null);
  }
}
