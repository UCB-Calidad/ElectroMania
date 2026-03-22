import { HttpErrorResponse } from '@angular/common/http';
import { LanguageService } from '../services/language.service';
export function getErrorMessage(err: unknown, languageService: LanguageService): string {
    if (err instanceof HttpErrorResponse) {
        if (err.error?.message) {
            return err.error.message;
        }
        if (err.message) {
            return err.message;
        }
        return languageService.instant('ERRORS.NETWORK');
    }
    if (err instanceof Error) {
        return err.message;
    }
    return languageService.instant('ERRORS.UNEXPECTED');
}
export class NotFoundError extends Error {
    override name = 'NotFoundError';
}
export class ValidationError extends Error {
    override name = 'ValidationError';
}