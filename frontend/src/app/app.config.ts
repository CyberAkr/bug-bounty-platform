import { ApplicationConfig, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpBackend } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/auth/jwt.interceptor';
import { JsonTranslateLoader } from './core/i18n/json-translate.loader';

export function loaderFactory(handler: HttpBackend): TranslateLoader {
  //  on passe le prefix et le suffix explicitement
  return new JsonTranslateLoader(handler, 'assets/i18n', '.json');
}

export function i18nInitializerFactory(translate: TranslateService) {
  return () => {
    const saved = localStorage.getItem('lang');
    const browser = (navigator.language || 'fr').split('-')[0];
    const lang = (saved === 'en' || browser === 'en') ? 'en' : 'fr';
    translate.addLangs(['fr', 'en']);
    translate.setDefaultLang('fr');
    translate.setFallbackLang('fr');
    return firstValueFrom(translate.use(lang));
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useFactory: loaderFactory, deps: [HttpBackend] },
      })
    ),
    { provide: APP_INITIALIZER, useFactory: i18nInitializerFactory, deps: [TranslateService], multi: true },
  ],
};
