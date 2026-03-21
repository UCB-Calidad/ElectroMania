import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { UserService } from '../../../services/user.service';
import { LanguageService } from '../../../services/language.service';
import { UserDisplay, User } from '../../../models';
import { UserFormModalComponent, UserFormData } from '../../../components/user-form-modal/user-form-modal.component';
import { AdminSidebarComponent } from '../../../components/admin-sidebar/admin-sidebar.component';
@Component({
    selector: 'app-usuarios-admin',
    standalone: true,
    imports: [CommonModule, FormsModule, UserFormModalComponent, AdminSidebarComponent, TranslateModule],
    templateUrl: './usuarios-admin.component.html',
    styleUrl: './usuarios-admin.component.css'
})
export class UsuariosAdminComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);
    private readonly toast = inject(ToastService);
    private readonly userService = inject(UserService);
    private readonly languageService = inject(LanguageService);
    busqueda = '';
    filtroRol = 'all';
    loading = signal(false);
    isModalOpen = signal(false);
    selectedUser = signal<UserFormData | null>(null);
    isEditing = signal(false);
    usuarios = signal<UserDisplay[]>([]);
    usuariosFiltrados = signal<UserDisplay[]>([]);
    private rawUsers: User[] = [];
    ngOnInit() {
        this.cargarUsuarios();
    }
    async cargarUsuarios() {
        this.loading.set(true);
        try {
            const users = await this.userService.getAllUsers();
            this.rawUsers = users;
            this.usuarios.set(this.mapUsersToDisplay(users));
            this.usuariosFiltrados.set([...this.usuarios()]);
        }
        catch {
            this.toast.error(this.languageService.instant('ADMIN.ERROR_LOAD_USERS'));
            this.usuarios.set([]);
            this.usuariosFiltrados.set([]);
        }
        finally {
            this.loading.set(false);
        }
    }
    private mapUsersToDisplay(users: User[]): UserDisplay[] {
        return users.map((u, index) => ({
            id: index + 1,
            nombre: u.name,
            email: u.email,
            rol: u.role.toLowerCase() === 'admin' ? 'Admin' : 'Cliente',
            nit_ci: u.nit_ci ?? (u as User & {
                nitCi?: string;
            }).nitCi ?? '',
            estado: 'Activo'
        }));
    }
    cerrarSesion() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
    filtrarUsuarios() {
        let resultado = [...this.usuarios()];
        if (this.busqueda.trim() !== '') {
            const busquedaLower = this.busqueda.toLowerCase();
            resultado = resultado.filter(usuario => usuario.nombre.toLowerCase().includes(busquedaLower) ||
                usuario.email.toLowerCase().includes(busquedaLower) ||
                usuario.nit_ci.toLowerCase().includes(this.busqueda.toLowerCase()) ||
                usuario.rol.toLowerCase().includes(busquedaLower));
        }
        if (this.filtroRol !== 'all') {
            resultado = resultado.filter(usuario => usuario.rol === this.filtroRol);
        }
        this.usuariosFiltrados.set(resultado);
    }
    aplicarFiltroRol(rol: string) {
        this.filtroRol = rol;
        this.filtrarUsuarios();
    }
    obtenerIniciales(nombre: string): string {
        return nombre
            .split(' ')
            .map(palabra => palabra.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }
    contarActivos(): number {
        return this.usuarios().filter(u => u.estado === 'Activo').length;
    }
    contarInactivos(): number {
        return this.usuarios().filter(u => u.estado === 'Inactivo').length;
    }
    agregarUsuario() {
        this.selectedUser.set(null);
        this.isEditing.set(false);
        this.isModalOpen.set(true);
    }
    editarUsuario(usuario: UserDisplay) {
        const user = this.rawUsers.find(u => u.email === usuario.email);
        this.selectedUser.set({
            uuid: user?.uuid,
            nombre: usuario.nombre,
            email: usuario.email,
            password: '',
            phone: user?.phone || '',
            nit_ci: usuario.nit_ci,
            social_reason: user?.social_reason || (user as User & {
                socialReason?: string;
            }).socialReason || '',
            rol: usuario.rol as 'Admin' | 'Cliente'
        });
        this.isEditing.set(true);
        this.isModalOpen.set(true);
    }
    handleModalCancel() {
        this.isModalOpen.set(false);
        this.selectedUser.set(null);
    }
    async handleModalSave(data: UserFormData) {
        this.isModalOpen.set(false);
        if (this.isEditing()) {
            this.toast.info(this.languageService.instant('ADMIN.EDIT_NOT_AVAILABLE'));
        }
        else {
            try {
                await this.userService.createUser({
                    name: data.nombre,
                    email: data.email,
                    password: data.password,
                    nit_ci: data.nit_ci,
                    social_reason: data.social_reason,
                    phone: data.phone
                });
                this.toast.success(this.languageService.instant('ADMIN.USER_CREATED'));
                await this.cargarUsuarios();
            }
            catch {
                this.toast.error(this.languageService.instant('ADMIN.ERROR_CREATE_USER'));
            }
        }
    }
    eliminarUsuario(_id: number) {
        this.toast.info(this.languageService.instant('ADMIN.DELETE_NOT_AVAILABLE'));
    }
    toggleEstado(_usuario: UserDisplay) {
        this.toast.info(this.languageService.instant('ADMIN.STATE_CHANGE_NOT_AVAILABLE'));
    }
    resetPassword(_usuario: UserDisplay) {
        this.toast.info(this.languageService.instant('ADMIN.RESET_NOT_AVAILABLE'));
    }
}