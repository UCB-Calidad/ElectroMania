import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from '../../services/user.service';
import { isAdminRole } from '../../constants/roles';
interface UserProfile {
    uuid: string;
    name: string;
    email: string;
    nit_ci: string;
    social_reason: string;
    role: string;
}
@Component({
    selector: 'app-perfil',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './perfil.component.html',
    styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
    private readonly userService = inject(UserService);
    private readonly translate = inject(TranslateService);
    user = signal<UserProfile | null>(null);
    loading = signal(true);
    isAdminRole = isAdminRole;
    ngOnInit() {
        this.loadProfile();
    }
    async loadProfile() {
        this.loading.set(true);
        try {
            this.user.set(await this.userService.getCurrentUser());
        }
        catch {
            console.error('Error loading profile');
        }
        finally {
            this.loading.set(false);
        }
    }
    getRoleLabel(role: string): string {
        return isAdminRole(role)
            ? this.translate.instant('PROFILE.ADMIN')
            : this.translate.instant('PROFILE.CLIENT');
    }
}