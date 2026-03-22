import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type StorageArea = 'local' | 'session';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private readonly platformId = inject(PLATFORM_ID);
    private get isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }
    private getStorage(area: StorageArea): Storage | null {
        if (!this.isBrowser) {
            return null;
        }
        return area === 'session' ? sessionStorage : localStorage;
    }
    getItem(key: string): string | null {
        return this.getLocalItem(key);
    }
    getLocalItem(key: string): string | null {
        return this.getStorage('local')?.getItem(key) ?? null;
    }
    getSessionItem(key: string): string | null {
        return this.getStorage('session')?.getItem(key) ?? null;
    }
    setItem(key: string, value: string): void {
        this.setLocalItem(key, value);
    }
    setLocalItem(key: string, value: string): void {
        this.getStorage('local')?.setItem(key, value);
    }
    setSessionItem(key: string, value: string): void {
        this.getStorage('session')?.setItem(key, value);
    }
    removeItem(key: string): void {
        this.removeLocalItem(key);
    }
    removeLocalItem(key: string): void {
        this.getStorage('local')?.removeItem(key);
    }
    removeSessionItem(key: string): void {
        this.getStorage('session')?.removeItem(key);
    }
    clear(): void {
        this.getStorage('local')?.clear();
    }
    clearSession(): void {
        this.getStorage('session')?.clear();
    }
}