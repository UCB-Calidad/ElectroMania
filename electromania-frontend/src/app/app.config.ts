import { ApplicationConfig, provideZoneChangeDetection, provideAppInitializer, inject, PLATFORM_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { isPlatformBrowser } from '@angular/common';
import { TRANSLATIONS } from './i18n/translations';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
function initializeTranslations(): Promise<void> {
    const translate = inject(TranslateService);
    const platformId = inject(PLATFORM_ID);
    translate.addLangs(['es', 'en']);
    translate.setTranslation('es', TRANSLATIONS.es);
    translate.setTranslation('en', TRANSLATIONS.en);
    let savedLang = 'es';
    if (isPlatformBrowser(platformId)) {
        savedLang = localStorage.getItem('electromania_lang') || 'es';
    }
    translate.use(savedLang);
    return Promise.resolve();
}
export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideClientHydration(withEventReplay()),
        provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
        provideTranslateService({
            fallbackLang: 'es'
        }),
        provideAppInitializer(initializeTranslations)
    ]
};