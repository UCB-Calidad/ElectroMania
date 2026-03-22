import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { LanguageService } from '../../services/language.service';
import { RegisterUserRequest } from '../../models';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { isValidEmail, isValidNIT, isValidPassword, passwordsMatch, formatNIT } from '../../utils/validators';
@Component({
    selector: 'app-registro',
    standalone: true,
    imports: [FormsModule, PasswordInputComponent, TranslateModule],
    templateUrl: './registro.component.html',
    styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);
    private readonly toast = inject(ToastService);
    private readonly languageService = inject(LanguageService);
    nit = '';
    razonSocial = '';
    email = '';
    phone = '';
    contrasena = '';
    confirmarContrasena = '';
    aceptaTerminos = false;
    volverAlLogin() {
        this.router.navigate(['/login']);
    }
    formatearNIT() {
        this.nit = formatNIT(this.nit);
    }
    formularioValido(): boolean {
        return isValidNIT(this.nit) &&
            this.razonSocial.trim().length > 0 &&
            isValidEmail(this.email) &&
            this.phone.trim().length >= 7 &&
            isValidPassword(this.contrasena) &&
            passwordsMatch(this.contrasena, this.confirmarContrasena) &&
            this.aceptaTerminos;
    }
    async registrar() {
        if (!this.formularioValido()) {
            this.toast.error(this.languageService.instant('REGISTER.FORM_INVALID'));
            return;
        }
        const data: RegisterUserRequest = {
            email: this.email,
            name: this.razonSocial,
            password: this.contrasena,
            nit_ci: this.nit,
            social_reason: this.razonSocial,
            phone: this.phone
        };
        try {
            await this.authService.registerUser(data);
            try {
                await this.authService.login({ email: this.email, password: this.contrasena });
                this.clearSensitiveData();
                this.toast.success(this.languageService.instant('REGISTER.SUCCESS_WELCOME'));
                this.router.navigate(['/bienvenida']);
            }
            catch {
                this.clearSensitiveData();
                this.toast.success(this.languageService.instant('REGISTER.SUCCESS'));
                this.volverAlLogin();
            }
        }
        catch {
            this.toast.error(this.languageService.instant('REGISTER.ERROR'));
        }
    }
    private clearSensitiveData() {
        this.contrasena = '';
        this.confirmarContrasena = '';
    }
    generarContrasena() {
      const chars ="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      const randomValues = new Uint8Array(12);
      globalThis.crypto.getRandomValues(randomValues);
      const contrasenaGenerada = Array.from(randomValues)
                                  .map(v => chars[v % chars.length])
                                  .join("");
      this.contrasena = contrasenaGenerada;
      this.confirmarContrasena = contrasenaGenerada;
    }
}
