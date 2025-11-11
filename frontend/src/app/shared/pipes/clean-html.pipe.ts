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

    // 2) Nettoyages textuels rapides (avant parsing DOM)
    html = html
      .replace(/<!--[\s\S]*?-->/g, '')                 // commentaires HTML
      .replace(/\r\n?/g, '\n')                         // normaliser les EOL
      .replace(/\u200B/g, '')                          // zero-width
      .replace(/&nbsp;/gi, ' ')                        // espace insécable -> espace simple
      .replace(/>\s+</g, '><')                         // espaces entre balises
      .replace(/\u00A0/g, ' ')                         // autre encodage d'espace insécable
      .trim();

    // 3) Parser en DOM pour opérations plus fines (suppression d'éléments "fantômes")
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div id="__root__">${html}</div>`, 'text/html');
      const root = doc.getElementById('__root__') as HTMLElement | null;

      if (root) {
        // Supprimer les nœuds vides ou contenant uniquement des <br> et espaces
        const maybeEmptySelectors = 'p,div,span,section,article';
        const candidates = Array.from(root.querySelectorAll<HTMLElement>(maybeEmptySelectors));

        for (const el of candidates) {
          // cloner le contenu texte nettoyé
          const text = el.textContent?.replace(/\s|&nbsp;|\u00A0/g, '') ?? '';
          const hasOnlyBr = el.childElementCount === 1 && el.children[0].tagName.toLowerCase() === 'br'
            || (Array.from(el.childNodes).every(n => (n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName.toLowerCase() === 'br') || (n.nodeType === Node.TEXT_NODE && !n.textContent?.trim())));

          // si pas de texte significatif et soit vide soit uniquement <br> -> on supprime
          if (!text && (hasOnlyBr || !el.innerHTML.replace(/(<br\s*\/?>|\s|&nbsp;|\u00A0)/gi, '').length)) {
            el.remove();
            continue;
          }

          // supprimer les <br> en début/fin du bloc
          el.innerHTML = el.innerHTML.replace(/^(?:\s|&nbsp;|<br\s*\/?>)+/i, '').replace(/(?:\s|&nbsp;|<br\s*\/?>)+$/i, '');
        }

        // Réduire séquences de <br> à un seul
        root.innerHTML = root.innerHTML.replace(/(<br\s*\/?>\s*){2,}/gi, '<br/>');

        // Détecter et "aplatir" <p><h2>…</h2></p> -> <h2>…</h2>
        root.innerHTML = root.innerHTML.replace(
          /<p>\s*(<(?:h[1-6]|table|ul|ol|pre|blockquote|div)[\s\S]*?<\/(?:h[1-6]|table|ul|ol|pre|blockquote|div)>)\s*<\/p>/gi,
          '$1'
        );

        // <td><p>…</p></td> -> <td>…</td> & similaire pour <th>
        root.innerHTML = root.innerHTML.replace(/<t([dh])>\s*<p>([\s\S]*?)<\/p>\s*<\/t\1>/gi, '<t$1>$2</t$1>');

        // Récupérer le HTML nettoyé
        html = root.innerHTML.trim();
      }
    } catch (e) {
      // En cas d'erreur de parsing on continue avec la version textuelle nettoyée précédente
      console.warn('CleanHtmlPipe: DOM parsing failed, falling back to string cleanup', e);
    }

    // 4) Nettoyage final textuel (sécurité supplémentaire)
    html = html
      // supprimer les tags vides résiduels <p></p> ou <div></div>
      .replace(/<(p|div|span|section|article)>\s*<\/\1>/gi, '')
      // supprimer <br> en début/fin absolu
      .replace(/^(<br\s*\/?>)+|(<br\s*\/?>)+$/gi, '')
      // compresser à nouveau les <br> multiples éventuels
      .replace(/(<br\s*\/?>\s*){2,}/gi, '<br/>')
      .trim();

    // 5) SANITIZE stricte (bloque styles inline / scripts / iframes / events)
    // Ajout de protections supplémentaires et d'un hook pour sécuriser les <a target="_blank">
    DOMPurify.addHook('afterSanitizeAttributes', function (node: Element) {
      // Forcer rel + noopener sur les liens ouvrant en nouvelle fenêtre
      if (node.tagName && node.tagName.toLowerCase() === 'a') {
        const a = node as HTMLAnchorElement;
        const href = a.getAttribute('href') || '';
        if (href && /^(https?:)?\/\//i.test(href)) {
          a.setAttribute('rel', 'noopener noreferrer');
        }
        // si target est fourni, autoriser mais sécuriser
        if (a.getAttribute('target') === '_blank') {
          a.setAttribute('rel', 'noopener noreferrer');
        }
      }

      // supprimer tout attribut onclick/on* par sécurité (au cas où)
      for (const attr of Array.from(node.attributes || [])) {
        if (/^on/i.test(attr.name)) {
          node.removeAttribute(attr.name);
        }
      }
    });

    const clean = DOMPurify.sanitize(html, {
      FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed'], // inclure les tags potentiellement dangereux
      FORBID_ATTR: ['style', 'onerror', 'onclick', 'onload', 'onmouseover', 'onfocus'], // patterns d'events courants
      ALLOWED_TAGS: [
        'a', 'b', 'i', 'em', 'strong', 'u', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'code', 'pre', 'blockquote', 'div', 'span', 'img'
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'src', 'alt', 'title', 'width', 'height'],
      RETURN_TRUSTED_TYPE: false // compatible Angular sanitizer usage
    });

    // 6) Renvoyer au template en SafeHtml
    return this.sanitizer.bypassSecurityTrustHtml(clean);
  }
}
