import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { UserService, UploadPhotoResponse } from '@app/features/users/user.service';
import { UserResponse } from '@app/models/user.model';

import { MyReportsComponent } from '@app/features/reports/my-reports/my-reports.component';
import { CompanyReceivedReportsComponent } from '@app/features/reports/company-received/company-received.component';

const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20MB

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslateModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDividerModule, MatProgressSpinnerModule,
    MyReportsComponent, CompanyReceivedReportsComponent,
    MatSnackBarModule
  ],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private snack = inject(MatSnackBar);

  user = signal<UserResponse | null>(null);

  verificationDocument: File | null = null;
  verificationDocumentName = signal<string>('');

  photoFile: File | null = null;
  photoPreviewUrl = signal<string | null>(null);

  // 🔐 état local du formulaire password
  showPwd = false;
  pwd = signal<{ current: string; next: string; confirm: string }>({ current: '', next: '', confirm: '' });

  /** À supprimer si proxy /files configuré */
  private backendBase = 'http://localhost:8080';

  ngOnInit(): void {
    this.userService.getMe().subscribe((data) => this.user.set(data));
  }

  ngOnDestroy(): void { this.revokePreview(); }

  isCompany(): boolean {
    return (this.user()?.role ?? '').toLowerCase() === 'company';
  }

  toggleShowPwd(): void { this.showPwd = !this.showPwd; }

  /** Helpers snackbars */
  private snackOk(msg: string): void {
    this.snack.open(msg, 'OK', { duration: 3000 });
  }
  private snackErr(msg: string): void {
    this.snack.open(msg, 'OK', { duration: 4000 });
  }

  /** Normalise simplement l'IBAN: trim + uppercase */
  normalizeIban(): void {
    const u = this.user();
    if (!u?.bankAccount) return;
    const compact = u.bankAccount.replace(/\s+/g, '').toUpperCase();
    this.user.set({ ...u, bankAccount: compact });
  }

  update(): void {
    const current = this.user();
    if (!current) return;

    const form = new FormData();
    form.append('firstName', current.firstName);
    form.append('lastName', current.lastName);
    form.append('preferredLanguage', current.preferredLanguage);
    form.append('bio', current.bio || '');
    form.append('profilePhoto', current.profilePhoto || '');

    // ✅ Envoi du champ optionnel
    if (current.bankAccount) {
      form.append('bankAccount', current.bankAccount);
    }

    if (this.verificationDocument) {
      form.append('verificationDocument', this.verificationDocument);
    }

    this.userService.updateWithForm(form).subscribe({
      next: () => this.snackOk('Profil mis à jour'),
      error: () => this.snackErr('Erreur lors de l’enregistrement')
    });
  }

  changePassword(): void {
    const { current, next, confirm } = this.pwd();
    if (!current || !next || !confirm) {
      this.snackErr('Veuillez remplir tous les champs.');
      return;
    }
    if (next !== confirm) {
      this.snackErr('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    if (next.length < 12 || !/[a-z]/.test(next) || !/[A-Z]/.test(next) || !/\d/.test(next)) {
      this.snackErr('Le nouveau mot de passe ne respecte pas la politique (12+ caractères, minuscule, majuscule, chiffre).');
      return;
    }

    this.userService.changePassword({ currentPassword: current, newPassword: next }).subscribe({
      next: () => {
        this.pwd.set({ current: '', next: '', confirm: '' });
        this.snackOk('Mot de passe mis à jour');
      },
      error: (err: HttpErrorResponse) => {
        const msg = (err.error && (err.error.error || err.error.message)) || err.message || 'Échec du changement de mot de passe';
        this.snackErr(msg);
      }
    });
  }

  delete(): void {
    // on garde la confirmation navigateur pour éviter les suppressions accidentelles
    if (!confirm('Supprimer votre compte ?')) return;

    this.userService.delete().subscribe({
      next: () => {
        this.snackOk('Compte supprimé');
        this.user.set(null);
        localStorage.removeItem('auth_token');
        window.location.href = '/';
      },
      error: () => this.snackErr('Erreur lors de la suppression')
    });
  }

  onVerificationSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input?.files?.length) return;

    const f = input.files[0];
    if (f.type !== 'application/pdf') {
      this.snackErr('Seuls les PDF sont acceptés.');
      input.value = '';
      this.verificationDocument = null;
      this.verificationDocumentName.set('');
      return;
    }
    if (f.size > MAX_PDF_BYTES) {
      this.snackErr('Fichier trop volumineux (>20MB).');
      input.value = '';
      this.verificationDocument = null;
      this.verificationDocumentName.set('');
      return;
    }
    this.verificationDocument = f;
    this.verificationDocumentName.set(f.name);
    this.snackOk('Document sélectionné');
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input?.files?.length) return;
    this.photoFile = input.files[0];

    this.revokePreview();
    const url = URL.createObjectURL(this.photoFile);
    this.photoPreviewUrl.set(url);
  }

  uploadPhoto(): void {
    if (!this.photoFile) {
      this.snackErr('Sélectionnez une image.');
      return;
    }

    this.userService.uploadPhoto(this.photoFile).subscribe({
      next: (res: UploadPhotoResponse) => {
        const u = this.user();
        if (u) this.user.set({ ...u, profilePhoto: res.profilePhoto });
        this.revokePreview();
        this.photoFile = null;
        this.snackOk('Photo mise à jour');
      },
      error: (err: HttpErrorResponse) => {
        const msg = (err.error && (err.error.error || err.error.message)) || err.message || 'Échec de l’upload';
        this.snackErr(msg);
      }
    });
  }

  resolvePhotoUrl(path?: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${this.backendBase}${path}`;
  }

  private revokePreview(): void {
    const current = this.photoPreviewUrl();
    if (current) URL.revokeObjectURL(current);
    this.photoPreviewUrl.set(null);
  }
}
