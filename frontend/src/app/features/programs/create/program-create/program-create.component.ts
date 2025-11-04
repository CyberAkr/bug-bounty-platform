import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EditorModule } from '@tinymce/tinymce-angular';
import DOMPurify from 'dompurify';
import { ProgramService } from '../../program.service';
import { environment } from '../../../../../environments/environments';

@Component({
  selector: 'app-program-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EditorModule],
  templateUrl: './program-create.component.html'
})
export class ProgramCreateComponent {
  private programs = inject(ProgramService);

  title = '';
  descriptionHtml = '';
  goal = '';

  loading = signal(false);
  error = signal<string | null>(null);

  hasActive = signal<boolean>(false);
  myProgramId = signal<number | null>(null);
  myProgramTitle = signal<string | null>(null);

  // expose la clé pour le template (utilisée via [apiKey])
  apiKey = environment.tinymceApiKey;

  tinyInit = {
    menubar: 'file edit view insert format table tools help',
    plugins: 'lists link table code paste wordcount autoresize',
    toolbar:
      'undo redo | styles | bold italic underline | forecolor backcolor | ' +
      'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | ' +
      'table | link | removeformat | code',
    style_formats: [
      { title: 'Titre 1', block: 'h1' },
      { title: 'Titre 2', block: 'h2' },
      { title: 'Paragraphe', block: 'p' },
      { title: 'Citation', block: 'blockquote' },
    ],
    table_toolbar:
      'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | ' +
      'tableinsertcolbefore tableinsertcolafter tabledeletecol',
    height: 420,
    branding: false,
    paste_as_text: false,
    content_style: 'body { font-family: Inter, system-ui, sans-serif; font-size: 14px; }'
  };

  constructor() {
    // vérifie si l'utilisateur a déjà un programme (empêche double création)
    this.programs.getMine().subscribe({
      next: (list) => {
        const p = Array.isArray(list) && list.length ? list[0] : null;
        if (p && (p.status === 'PENDING' || p.status === 'APPROVED')) {
          this.hasActive.set(true);
          this.myProgramId.set(p.id ?? p.programId);
          this.myProgramTitle.set(p.title);
        }
      },
      error: () => {}
    });
  }

  publish(): void {
    if (this.hasActive()) {
      this.error.set('Un programme est déjà en cours/actif pour votre entreprise.');
      return;
    }
    const title = this.title.trim();
    // sanitize HTML riche
    const cleanHtml = DOMPurify.sanitize(this.descriptionHtml, { USE_PROFILES: { html: true } });
    if (!title || !cleanHtml || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    this.programs.checkoutBeforeCreate(title, cleanHtml).subscribe({
      next: (res) => {
        if (res?.url) {
          window.location.href = res.url;
        } else {
          this.error.set('Pas de redirection Stripe.');
          this.loading.set(false);
        }
      },
      error: (err) => {
        const msg = (err?.status === 409)
          ? 'Un programme de votre entreprise existe déjà (en cours/actif).'
          : (err?.error || 'Erreur lors de la redirection vers Stripe.');
        this.error.set(msg);
        this.loading.set(false);
      }
    });
  }
}
