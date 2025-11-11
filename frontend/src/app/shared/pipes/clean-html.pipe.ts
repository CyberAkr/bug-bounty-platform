import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

@Pipe({ name: 'cleanHtml', standalone: true })
export class CleanHtmlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(raw: string | null | undefined): SafeHtml | '' {
    if (!raw) return '';

    const decode = (s: string) => {
      const el = document.createElement('textarea');
      el.innerHTML = s;
      return el.value;
    };

    // 1) Décodage 1× puis 2× si besoin (gère &lt;h1&gt; ou &amp;lt;h1&amp;gt;)
    let html = decode(raw);
    if (html.includes('&lt;') || html.includes('&gt;') || html.includes('&amp;')) {
      html = decode(html);
    }

    // 2) Nettoyage des causes de "grands vides"
    html = html
      .replace(/<!--[\s\S]*?-->/g, '')                 // commentaires
      .replace(/<style[\s\S]*?<\/style>/gi, '')        // <style>…</style>
      .replace(/\r\n?/g, '\n')                         // fins de ligne
      .replace(/\u200B/g, '')                          // zero-width
      .replace(/&nbsp;/g, ' ')                         // espaces durs -> espace simple
      .replace(/>\s+</g, '><')                         // espace entre balises
      .replace(/(<br\s*\/?>\s*){2,}/gi, '<br/>')       // <br> multiples -> 1
      .replace(/<p>\s*(?:<br\s*\/?>|\s)*<\/p>/gi, '')  // <p> vides
      // <p><h2>…</h2></p> -> <h2>…</h2>
      .replace(
        /<p>\s*(<(?:h[1-6]|table|ul|ol|pre|blockquote|div)[\s\S]*?<\/(?:h[1-6]|table|ul|ol|pre|blockquote|div)>)\s*<\/p>/gi,
        '$1'
      )
      // <td><p>…</p></td> -> <td>…</td>  et idem pour <th>
      .replace(/<t([dh])>\s*<p>([\s\S]*?)<\/p>\s*<\/t\1>/gi, '<t$1>$2</t$1>')
      .trim();

    // 3) Sanitize strict (pas de style inline ni d'attributs d'event)
    const clean = DOMPurify.sanitize(html, {
      FORBID_TAGS: ['style'],
      FORBID_ATTR: ['style', 'onerror', 'onclick', 'onload'],
      ALLOWED_TAGS: [
        'a','b','i','em','strong','u','p','h1','h2','h3','h4','h5','h6',
        'ul','ol','li','br','hr','table','thead','tbody','tr','th','td',
        'code','pre','blockquote','div','span','img'
      ],
      ALLOWED_ATTR: ['href','target','rel','class','src','alt','title']
    });

    return this.sanitizer.bypassSecurityTrustHtml(clean);
  }
}
