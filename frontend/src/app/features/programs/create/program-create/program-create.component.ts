import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EditorModule } from '@tinymce/tinymce-angular';
import DOMPurify from 'dompurify';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatButtonModule }     from '@angular/material/button';
import { MatIconModule }       from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ProgramService } from '../../program.service';
import { environment } from '../../../../../environments/environments';

@Component({
  selector: 'app-program-create',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, EditorModule,
    TranslateModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule
  ],
  templateUrl: './program-create.component.html'
})
export class ProgramCreateComponent {
  private programs = inject(ProgramService);
  private i18n = inject(TranslateService);

  title = '';
  descriptionHtml = '';
  goal = '';

  loading = signal(false);
  error   = signal<string | null>(null);

  hasActive     = signal<boolean>(false);
  myProgramId   = signal<number | null>(null);
  myProgramTitle= signal<string | null>(null);

  apiKey = environment.tinymceApiKey;

  // ✅ TinyMCE INIT — empêche l’encodage & le spam de balises, whitelist propre
  tinyInit: any = {
    menubar: false,
    plugins: 'lists link table code paste autoresize',
    toolbar: [
      'undo redo | bold italic underline | bullist numlist |',
      'link table | alignleft aligncenter alignright | removeformat | code'
    ].join(' '),

    // ESSENTIEL
    entity_encoding: 'raw',            // évite les &lt; &gt; en base
    remove_trailing_brs: true,         // pas de <br> en fin
    forced_root_block: 'p',            // structure propre en <p>

    // Collage propre
    paste_data_images: false,
    paste_webkit_styles: 'none',
    paste_remove_styles: true,
    paste_remove_spans: true,
    paste_as_text: false,

    // Whitelist d’éléments simples (pas de style/script)
    valid_elements:
      'p,br,ul,ol,li,' +
      'a[href|target|rel],' +
      'b,strong,i,em,u,' +
      'h1,h2,h3,h4,h5,h6,' +
      'table,thead,tbody,tr,th,td,' +
      'blockquote,code,pre,div,span',
    invalid_elements: 'style,script',

    // Style d’édition (juste pour l’éditeur)
    content_style: `
      body{font-family:Inter,system-ui,sans-serif;font-size:14px;line-height:1.55}
      h1,h2,h3{font-weight:600}
      table{border-collapse:collapse;width:100%}
      th,td{border:1px solid #e5e7eb;padding:6px;text-align:left}
    `,
    height: 420,
    branding: false
  };

  constructor() {
    // Vérifie si un programme de l'entreprise est déjà actif
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
      this.error.set(this.i18n.instant('programs.create.errors.alreadyActive'));
      return;
    }

    const title = this.title.trim();
    // 🛡️ Sanitize renforcé avant envoi backend
    const cleanHtml = this.sanitizeForSave(this.descriptionHtml);

    if (!title || !cleanHtml || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    // Création + checkout Stripe (flux "before create")
    this.programs.checkoutBeforeCreate(title, cleanHtml).subscribe({
      next: (res) => {
        if (res?.url) {
          window.location.href = res.url;
        } else {
          this.error.set(this.i18n.instant('programs.create.errors.noStripeUrl'));
          this.loading.set(false);
        }
      },
      error: (err) => {
        const msg = (err?.status === 409)
          ? this.i18n.instant('programs.create.errors.conflict')
          : (err?.error || this.i18n.instant('programs.create.errors.generic'));
        this.error.set(msg);
        this.loading.set(false);
      }
    });
  }

  /** Sanitize + normalise pour éviter l’encodage/vides à l’affichage */
  private sanitizeForSave(raw: string): string {
    if (!raw) return '';

    // 1) trim & normalise fins de ligne
    let html = raw.replace(/\r\n?/g, '\n').trim();

    // 2) supprime commentaires/style
    html = html
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/\u200B/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/(<br\s*\/?>\s*){2,}/gi, '<br/>')
      .replace(/<p>\s*(?:<br\s*\/?>|\s)*<\/p>/gi, '')
      .replace(
        /<p>\s*(<(?:h[1-6]|table|ul|ol|pre|blockquote|div)[\s\S]*?<\/(?:h[1-6]|table|ul|ol|pre|blockquote|div)>)\s*<\/p>/gi,
        '$1'
      )
      .replace(/<t([dh])>\s*<p>([\s\S]*?)<\/p>\s*<\/t\1>/gi, '<t$1>$2</t$1>');

    // 3) DOMPurify strict (pas de style/handlers)
    const purified = DOMPurify.sanitize(html, {
      FORBID_TAGS: ['style', 'script'],
      FORBID_ATTR: ['style', 'onerror', 'onclick', 'onload'],
      ALLOWED_TAGS: [
        'a','b','i','em','strong','u','p','h1','h2','h3','h4','h5','h6',
        'ul','ol','li','br','hr','table','thead','tbody','tr','th','td',
        'code','pre','blockquote','div','span','img'
      ],
      ALLOWED_ATTR: ['href','target','rel','class','src','alt','title']
    });

    return (purified || '').trim();
  }
}
