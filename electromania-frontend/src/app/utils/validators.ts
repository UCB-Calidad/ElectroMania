export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@.]+@[^\s@.]+(\.[^\s@.]+)+$/;
    return emailRegex.test(email);
}
export function isValidNIT(nit: string): boolean {
    return nit.length >= 7 && nit.length <= 15 && /^\d+$/.test(nit);
}
export function isValidPassword(password: string, minLength = 6): boolean {
    return password.length >= minLength;
}
export function passwordsMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword;
}
export function formatNIT(value: string): string {
    const digitsOnly = value.replaceAll(/\D/g, '');
    return digitsOnly.substring(0, 15);
}