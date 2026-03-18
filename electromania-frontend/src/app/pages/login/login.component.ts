import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { LanguageService } from '../../services/language.service';
import { LoginRequest } from '../../models';
import { ROUTES, isAdminRole } from '../../constants';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { LoginUserResponse } from '../../models/auth.model';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, RouterLink, PasswordInputComponent, TranslateModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly languageService = inject(LanguageService);

  mostrarFormLogin = false;
  email = '';
  contrasena = '';

  registro() {
    this.router.navigate(['/', ROUTES.REGISTRO]);
  }

  mostrarLogin() {
    this.mostrarFormLogin = true;
  }

  async iniciarSesion() {
    const credentials: LoginRequest = {
      email: this.email,
      password: this.contrasena
    };

    try {
      await this.authService.login(credentials);

      const user = JSON.parse(localStorage.getItem('user') || '{}') as LoginUserResponse;
      const role = user.role;
      if (isAdminRole(role)) {
        this.router.navigate(['/', ROUTES.DASHBOARD]);
        this.toast.success(this.languageService.instant('AUTH.WELCOME_ADMIN'));
      } else {
        this.router.navigate(['/', ROUTES.HOME]);
        this.toast.success(this.languageService.instant('AUTH.LOGIN_SUCCESS'));
      }
    } catch {
      this.toast.error(this.languageService.instant('AUTH.LOGIN_ERROR'));
    }
  }
}