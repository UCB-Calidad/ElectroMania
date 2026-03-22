import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LoginRequest, RegisterUserRequest, UserInfo, LoginUserResponse } from '../models';
import { API, ROLES, isAdminRole, STORAGE_KEYS } from '../constants';
import { StorageService } from './storage.service';
@Injectable({
    providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storageService = inject(StorageService);

  private readonly _authState = signal<boolean>(false);

  readonly isAuthenticated$ = this._authState.asReadonly();

  readonly currentUser = computed<UserInfo | null>(() => {
    if (!this._authState()) return null;
    return this.getUserInfo();
  });

  constructor() {
    const cookies = document.cookie.split(';');
    const accessToken = cookies.some(item=> item.includes('access_token')
    );
    console.log(accessToken)
    this._authState.set(accessToken != null);
  }

  async registerUser(data: RegisterUserRequest): Promise<void> {
    await firstValueFrom(this.http.post(API.AUTH.REGISTER, data));
  }

  async login(data: LoginRequest): Promise<LoginUserResponse> {
    const response = await firstValueFrom(
      this.http.post<LoginUserResponse>(API.AUTH.LOGIN, data,{
        withCredentials: true
      })
    );

    if (response) {
      this.storageService.setItem("user", JSON.stringify(response));
      this._authState.set(true);
    }
    return response;
  }

  getRole(): string {
    const user = this.getUserInfo();
    if (!user) return ROLES.GUEST;
    return user.role.toLowerCase();
  }

  isAdmin(): boolean {
    const role = this.getRole();
    return isAdminRole(role);
  }

  logout(): void {
    this.storageService.removeItem(STORAGE_KEYS.TOKEN);
    this._authState.set(false);
  }

  getUser(): string | null {
    return this.storageService.getItem(STORAGE_KEYS.USER);
  }

  isAuthenticated(): boolean {
    return !!this.getUser();
  }

  getUserInfo(): UserInfo | null {
    const user = JSON.parse(this.getUser() || '{}') as LoginUserResponse | null;
    if (!user) return null;
    return{
      id: user.uuid,
      email: user.email,
      nombre: user.social_reason,
      role: user.role || ROLES.CLIENTE
    }
  }
  // private checkAuthState(): boolean {
  //   return !!this.getToken() && !this.isTokenExpired();
  // }
}
