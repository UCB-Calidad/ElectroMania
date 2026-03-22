import { Injectable, signal, computed, inject, PLATFORM_ID, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../constants';
const STORAGE_KEY = STORAGE_KEYS.THEME;
@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly platformId = inject(PLATFORM_ID);
    private readonly storageService = inject(StorageService);
    private readonly isDarkSignal = signal(true);
    private get isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }
    readonly isDark = this.isDarkSignal.asReadonly();
    readonly theme = computed(() => this.isDarkSignal() ? 'dark' : 'light');
    constructor() {
        afterNextRender(() => {
            this.initTheme();
        });
    }
    private initTheme(): void {
        if (!this.isBrowser)
            return;
        const savedTheme = this.storageService.getItem(STORAGE_KEY);
        const prefersDark = typeof globalThis.matchMedia === 'function'
            ? globalThis.matchMedia('(prefers-color-scheme: dark)').matches
            : true;
        if (savedTheme) {
            this.isDarkSignal.set(savedTheme === 'dark');
        }
        else {
            this.isDarkSignal.set(prefersDark);
        }
        this.applyTheme();
    }
    toggle(): void {
        this.isDarkSignal.update(v => !v);
        this.applyTheme();
    }
    private applyTheme(): void {
        if (!this.isBrowser)
            return;
        const theme = this.theme();
        document.documentElement.dataset['theme'] = theme;
        this.storageService.setItem(STORAGE_KEY, theme);
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#050a10' : '#f0f8ff');
        }
    }
}