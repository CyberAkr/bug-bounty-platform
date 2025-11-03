// src/app/core/i18n/json-translate.loader.ts
import { HttpBackend, HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

export class JsonTranslateLoader implements TranslateLoader {
  private http: HttpClient;

  constructor(
    handler: HttpBackend,
    private prefix = 'assets/i18n',   // ✅ sans slash initial
    private suffix = '.json'
  ) {
    this.http = new HttpClient(handler);
  }

  getTranslation(lang: string): Observable<any> {
    const url = `${this.prefix}/${lang}${this.suffix}`;
    console.log('[i18n] GET', url);  // → "assets/i18n/fr.json"
    return this.http.get<any>(url);
  }
}
