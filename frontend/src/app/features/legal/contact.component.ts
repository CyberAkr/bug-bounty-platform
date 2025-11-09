import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslateModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCheckboxModule,
    MatSnackBarModule
  ],
  templateUrl: './contact.component.html'
})
export class ContactComponent {
  private i18n = inject(TranslateService);
  private snack = inject(MatSnackBar);

  name = signal('');
  email = signal('');
  subject = signal('');
  message = signal('');
  consent = signal(false);

  submitting = signal(false);
  feedback = signal<string | null>(null);
  ok = signal(false);

  isValid = computed(() =>
    !!this.name().trim() &&
    !!this.subject().trim() &&
    !!this.message().trim() &&
    this.consent() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email())
  );

  submit() {
    if (!this.isValid()) return;
    this.submitting.set(true);
    this.feedback.set(null);

    // TODO: brancher sur votre backend (ex: POST /api/contact)
    setTimeout(() => {
      this.submitting.set(false);
      this.ok.set(true);
      const okMsg = this.i18n.instant('contact.success');
      this.feedback.set(okMsg);
      this.snack.open(okMsg, 'OK', { duration: 2500 });
      this.name.set(''); this.email.set(''); this.subject.set(''); this.message.set(''); this.consent.set(false);
    }, 700);
  }
}
