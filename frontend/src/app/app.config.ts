import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { routes } from './app.routes';
import { JwtInterceptor } from './core/auth/jwt.interceptor';
import { JsonTranslateLoader } from './core/i18n/json-translate.loader';

export function loaderFactory(http: HttpClient): TranslateLoader {
  return new JsonTranslateLoader(http); // => /assets/i18n/{lang}.json
}

export const appConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([JwtInterceptor])),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'fr',
        loader: {
          provide: TranslateLoader,
          useFactory: loaderFactory,
          deps: [HttpClient],
        },
      })
    ),
  ],
};
