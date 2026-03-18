import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../constants';
export type Language = 'es' | 'en';
export interface LanguageOption {
    code: Language;
    name: string;
}
const STORAGE_KEY = STORAGE_KEYS.LANGUAGE;
const DEFAULT_LANG: Language = 'es';
@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private readonly translate = inject(TranslateService);
    private readonly storageService = inject(StorageService);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly _currentLang = signal<Language>(DEFAULT_LANG);
    readonly currentLang = this._currentLang.asReadonly();
    readonly availableLanguages: LanguageOption[] = [
        { code: 'es', name: 'Español' },
        { code: 'en', name: 'English' }
    ];
    constructor() {
        this.syncCurrentLang();
    }
    private syncCurrentLang(): void {
        const currentLang = this.translate.getCurrentLang();
        this._currentLang.set(this.isValidLang(currentLang) ? currentLang : DEFAULT_LANG);
    }
    private isValidLang(lang: string | undefined): lang is Language {
        return lang === 'es' || lang === 'en';
    }
    setLanguage(lang: Language): void {
        this.translate.use(lang);
        this._currentLang.set(lang);
        this.storageService.setItem(STORAGE_KEY, lang);
        if (isPlatformBrowser(this.platformId)) {
            document.documentElement.lang = lang;
        }
    }
    getCurrentLanguageName(): string {
        const lang = this.availableLanguages.find(l => l.code === this._currentLang());
        return lang?.name || 'Español';
    }
    instant(key: string, params?: Record<string, unknown>): string {
        return this.translate.instant(key, params);
    }
}