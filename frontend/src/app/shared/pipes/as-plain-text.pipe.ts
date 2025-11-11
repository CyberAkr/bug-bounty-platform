// src/app/shared/pipes/as-plain-text.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'asPlainText', standalone: true })
export class AsPlainTextPipe implements PipeTransform {
  transform(raw: unknown, maxLen = 150, fallback = 'Aucune description fournie.'): string {
    if (raw == null) return fallback;
    let s = String(raw);

    // --- même logique de décodage que ton cleanHtml ---
    const decode = (v: string) => {
      const el = document.createElement('textarea');
      el.innerHTML = v;
      return el.value;
    };
    s = decode(s);
    if (s.includes('&lt;') || s.includes('&gt;') || s.includes('&amp;')) s = decode(s);

    // --- nettoyage structure ---
    s = s
      .replace(/<!--[\s\S]*?-->/g, '')            // commentaires
      .replace(/<style[\s\S]*?<\/style>/gi, '')   // style
      .replace(/<script[\s\S]*?<\/script>/gi, '') // script
      .replace(/\u200B/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/<br\s*\/?>/gi, ' ')               // <br> -> espace
      .replace(/<[^>]*>/g, '')                    // supprime TOUTES balises
      .replace(/\s+/g, ' ')
      .trim();

    if (!s) return fallback;

    // tronque propre
    if (s.length > maxLen) {
      const cut = s.slice(0, maxLen).replace(/\s+\S*$/, '');
      return (cut || s.slice(0, maxLen)).trim() + '…';
    }
    return s;
  }
}
