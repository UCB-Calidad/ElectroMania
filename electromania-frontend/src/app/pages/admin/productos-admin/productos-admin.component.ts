import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AdminSidebarComponent } from '../../../components/admin-sidebar/admin-sidebar.component';
import { ProductosService } from '../../../services/productos.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { ModalService } from '../../../services/modal.service';
import { LanguageService } from '../../../services/language.service';
import { ProductFormModalComponent, ProductFormData } from '../../../components/product-form-modal/product-form-modal.component';
import { ProductDisplay } from '../../../models';
import { exportToCsv, exportToXlsx } from '../../../utils/export';
import { INVENTORY } from '../../../constants';

interface InventoryExportRow {
    id: number;
    nombre: string;
    categoria: string;
    precio: number;
    stock: number;
    estado: string;
}
@Component({
    selector: 'app-productos-admin',
    standalone: true,
    imports: [FormsModule, AdminSidebarComponent, ProductFormModalComponent, TranslateModule],
    templateUrl: './productos-admin.component.html',
    styleUrl: './productos-admin.component.css'
})
export class ProductosAdminComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly productosService = inject(ProductosService);
    private readonly authService = inject(AuthService);
    private readonly toast = inject(ToastService);
    private readonly modalService = inject(ModalService);
    private readonly languageService = inject(LanguageService);
    paginaActual = 1;
    productosPorPagina = INVENTORY.ITEMS_PER_PAGE;
    isModalOpen = signal(false);
    selectedProduct = signal<ProductFormData | null>(null);
    isEditing = signal(false);
    loading = signal(false);
    productos = signal<ProductDisplay[]>([]);
    totalPaginas = signal(0);
    stockBajoCount = signal(0);
    paginatedProducts = signal<ProductDisplay[]>([]);
    exportMenuOpen = signal(false);
    ngOnInit() {
        this.cargarProductos();
    }
    async cargarProductos() {
        this.loading.set(true);
        try {
            const data = await this.productosService.getAllProducts();
            this.productos.set(data.map(p => ({
                id: p.product_id,
                nombre: p.product_name,
                categoria: 'General',
                precio: p.price,
                stock: p.stock,
                activo: p.state === 'AVAILABLE',
                description: p.description,
                images: p.images || []
            })));
            this.updateDerivedState();
        }
        catch {
            this.productos.set([]);
            this.paginatedProducts.set([]);
            this.totalPaginas.set(0);
            this.toast.error(this.languageService.instant('ADMIN.ERROR_LOAD_PRODUCTS'));
        }
        finally {
            this.loading.set(false);
        }
    }
    private updateDerivedState(): void {
        const productos = this.productos();
        const totalPaginas = Math.ceil(productos.length / this.productosPorPagina);
        this.totalPaginas.set(totalPaginas);
        if (totalPaginas === 0) {
            this.paginaActual = 1;
        }
        else if (this.paginaActual > totalPaginas) {
            this.paginaActual = totalPaginas;
        }
        this.stockBajoCount.set(productos.filter(p => p.stock <= INVENTORY.LOW_STOCK_THRESHOLD).length);
        this.updatePaginatedProducts();
    }
    private updatePaginatedProducts(): void {
        const start = (this.paginaActual - 1) * this.productosPorPagina;
        const end = start + this.productosPorPagina;
        this.paginatedProducts.set(this.productos().slice(start, end));
    }
    ingresar() {
        this.router.navigate(['/login']);
    }
    Dashboard() {
        this.router.navigate(['/dashboard']);
    }
    Usuarios() {
        this.router.navigate(['/usuarios-admin']);
    }
    cerrarSesion() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
    openCreateModal() {
        this.selectedProduct.set(null);
        this.isEditing.set(false);
        this.isModalOpen.set(true);
    }
    openEditModal(producto: ProductDisplay) {
        this.selectedProduct.set({
            id: producto.id,
            nombre: producto.nombre,
            descripcion: producto.description || '',
            price: producto.precio,
            stock: producto.stock,
            categoria: producto.categoria,
            existingImages: producto.images || []
        });
        this.isEditing.set(true);
        this.isModalOpen.set(true);
    }
    handleModalCancel() {
        this.isModalOpen.set(false);
        this.selectedProduct.set(null);
    }
    async handleModalSave(data: ProductFormData) {
        this.isModalOpen.set(false);
        if (this.isEditing() && data.id) {
            try {
                await this.productosService.updateProduct(data.id, {
                    product_name: data.nombre,
                    description: data.descripcion,
                    price: data.price,
                    stock: data.stock,
                    image: data.imagen
                });
                if (data.selectedImageUrl && !data.imagen) {
                    const existingImages = data.existingImages || [];
                    const lastImage = existingImages.at(-1);
                    if (data.selectedImageUrl !== lastImage) {
                        await this.productosService.addProductImage({
                            name: data.nombre,
                            image_url: data.selectedImageUrl
                        });
                    }
                }
                this.toast.success(this.languageService.instant('ADMIN.PRODUCT_UPDATED'));
                await this.cargarProductos();
            }
            catch {
                this.toast.error(this.languageService.instant('ADMIN.ERROR_UPDATE_PRODUCT'));
            }
        }
        else {
            try {
                await this.productosService.createProduct({
                    product_name: data.nombre,
                    description: data.descripcion,
                    price: data.price,
                    stock: data.stock,
                    image: data.imagen
                });
                this.toast.success(this.languageService.instant('ADMIN.PRODUCT_CREATED'));
                await this.cargarProductos();
            }
            catch {
                this.toast.error(this.languageService.instant('ADMIN.ERROR_CREATE_PRODUCT'));
            }
        }
    }
    async eliminarProducto(id: number | undefined) {
        if (!id)
            return;
        const confirmed = await this.modalService.confirm({
            title: this.languageService.instant('ADMIN.DELETE_PRODUCT_TITLE'),
            message: this.languageService.instant('ADMIN.CONFIRM_DELETE_PRODUCT'),
            confirmText: this.languageService.instant('COMMON.DELETE'),
            type: 'danger'
        });
        if (confirmed) {
            try {
                await this.productosService.deleteProduct(id);
                this.toast.success(this.languageService.instant('ADMIN.PRODUCT_DELETED'));
                await this.cargarProductos();
            }
            catch {
                this.toast.error(this.languageService.instant('ADMIN.ERROR_DELETE_PRODUCT'));
            }
        }
    }
    async toggleActivo(producto: ProductDisplay) {
        const newState = !producto.activo;
        const newStateBackend = newState ? 'AVAILABLE' : 'UNAVAILABLE';
        try {
            await this.productosService.updateProduct(producto.id!, {
                state: newStateBackend
            });
            this.productos.set(this.productos().map(p =>
                p.id === producto.id ? { ...p, activo: newState } : p
            ));
            this.updatePaginatedProducts();
            this.toast.success(this.languageService.instant(newState ? 'ADMIN.PRODUCT_ACTIVATED' : 'ADMIN.PRODUCT_DEACTIVATED'));
        }
        catch {
            this.toast.error(this.languageService.instant('ADMIN.ERROR_CHANGE_STATE'));
        }
    }
    calcularValorTotal(): string {
        const total = this.productos().reduce((sum, producto) => {
            return sum + (producto.precio * producto.stock);
        }, 0);
        return total.toFixed(2);
    }
    toggleExportMenu() {
        this.exportMenuOpen.update(v => !v);
    }
    exportarInventario(formato: 'csv' | 'xlsx') {
        const rows = this.getInventoryExportRows();
        const headers: { key: keyof InventoryExportRow; label: string; }[] = [
            { key: 'id', label: this.languageService.instant('ADMIN.ID') },
            { key: 'nombre', label: this.languageService.instant('ADMIN.PRODUCT') },
            { key: 'categoria', label: this.languageService.instant('PRODUCTS.CATEGORY') },
            { key: 'precio', label: `${this.languageService.instant('ADMIN.PRICE')} (${this.languageService.instant('CART.BS')})` },
            { key: 'stock', label: this.languageService.instant('ADMIN.STOCK') },
            { key: 'estado', label: this.languageService.instant('ADMIN.STATE') }
        ];
        this.exportMenuOpen.set(false);
        if (rows.length === 0) {
            this.toast.info(this.languageService.instant('ADMIN.NO_PRODUCTS'));
            return;
        }
        if (formato === 'csv') {
            exportToCsv(rows, 'inventario-electromania', headers);
            this.toast.success(this.languageService.instant('ADMIN.INVENTORY_EXPORTED_CSV'));
            return;
        }
        exportToXlsx(rows, 'inventario-electromania', headers, {
            sheetName: this.languageService.instant('ADMIN.SHEET_INVENTORY'),
            title: this.languageService.instant('ADMIN.EXPORT_INVENTORY_TITLE'),
            exportDateLabel: this.languageService.instant('ADMIN.EXPORT_DATE')
        }).then(() => {
            this.toast.success(this.languageService.instant('ADMIN.INVENTORY_EXPORTED_XLSX'));
        }).catch(() => {
            this.toast.error(this.languageService.instant('ADMIN.ERROR_EXPORT_INVENTORY'));
        });
    }
    private getInventoryExportRows(): InventoryExportRow[] {
        return this.productos().map(producto => ({
            id: producto.id ?? 0,
            nombre: producto.nombre,
            categoria: producto.categoria,
            precio: producto.precio,
            stock: producto.stock,
            estado: producto.activo
                ? this.languageService.instant('ADMIN.ACTIVE')
                : this.languageService.instant('ADMIN.INACTIVE')
        }));
    }
    cambiarPagina(pagina: number) {
        if (pagina >= 1 && pagina <= this.totalPaginas()) {
            this.paginaActual = pagina;
            this.updatePaginatedProducts();
        }
    }
}