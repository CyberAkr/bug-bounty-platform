import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

export class JsonTranslateLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    private prefix = 'assets/i18n',   // chemin SAFE (pas de "./")
    private suffix = '.json'
  ) {}

  getTranslation(lang: string): Observable<any> {
    return this.http.get<any>(`${this.prefix}/${lang}${this.suffix}`);
  }
}
