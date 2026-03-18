import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ProductosService } from '../../services/productos.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { StorageService } from '../../services/storage.service';
import { LanguageService } from '../../services/language.service';
import { STORAGE_KEYS } from '../../constants';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductCard } from '../../models';
type SortOrder = 'relevancia' | 'precioAsc' | 'precioDesc' | 'nombre';
interface SavedFilters {
    busqueda?: string;
    orden?: SortOrder;
    categoria?: string;
    precio?: string;
    disponibilidad?: string;
}
const PRICE_FILTERS = {
    LOW_MAX: 50,
    MID_MAX: 100,
} as const;
@Component({
    selector: 'app-home',
    standalone: true,
    imports: [FormsModule, ProductCardComponent, TranslateModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
    readonly router = inject(Router);
    private readonly productosService = inject(ProductosService);
    private readonly cartService = inject(CartService);
    private readonly toast = inject(ToastService);
    private readonly storageService = inject(StorageService);
    private readonly languageService = inject(LanguageService);
    filtrosAvanzadosAbierto = false;
    busqueda = '';
    orden: SortOrder = 'relevancia';
    categoriaSeleccionada = '';
    precioSeleccionado = '';
    disponibilidadSeleccionada = '';
    loading = signal(false);
    categorias = signal<string[]>([]);
    productos = signal<ProductCard[]>([]);
    productosFiltrados = signal<ProductCard[]>([]);
    get tieneFiltrosActivos(): boolean {
        return this.busqueda.trim() !== '' ||
            this.orden !== 'relevancia' ||
            this.categoriaSeleccionada !== '' ||
            this.precioSeleccionado !== '' ||
            this.disponibilidadSeleccionada !== '';
    }
    ngOnInit() {
        this.cargarFiltrosGuardados();
        this.cargarProductos();
        this.cargarCategorias();
    }
    async cargarProductos() {
        this.loading.set(true);
        try {
            const data = await this.productosService.getAllProducts();
            this.productos.set(this.productosService.toProductCards(data));
            this.aplicarFiltros();
        }
        catch {
            this.toast.error(this.languageService.instant('ERRORS.LOAD_PRODUCTS'));
        }
        finally {
            this.loading.set(false);
        }
    }
    toggleFiltrosAvanzados() {
        this.filtrosAvanzadosAbierto = !this.filtrosAvanzadosAbierto;
    }
    cargarFiltrosGuardados() {
        const filtros = this.storageService.getItem(STORAGE_KEYS.FILTERS);
        if (filtros) {
            const data: SavedFilters = JSON.parse(filtros);
            this.busqueda = data.busqueda ?? '';
            this.orden = data.orden ?? 'relevancia';
            this.categoriaSeleccionada = data.categoria ?? '';
            this.precioSeleccionado = data.precio ?? '';
            this.disponibilidadSeleccionada = data.disponibilidad ?? '';
        }
    }
    guardarFiltros() {
        const data = {
            busqueda: this.busqueda,
            orden: this.orden,
            categoria: this.categoriaSeleccionada,
            precio: this.precioSeleccionado,
            disponibilidad: this.disponibilidadSeleccionada
        };
        this.storageService.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(data));
    }
    async cargarCategorias() {
        try {
            this.categorias.set(await this.productosService.getCategoriasAsStrings());
        }
        catch {
            this.categorias.set([]);
        }
    }
    buscarComponentes() {
        this.guardarFiltros();
        this.aplicarFiltros();
    }
    ordenarComponentes() {
        this.guardarFiltros();
        this.aplicarFiltros();
    }
    aplicarFiltrosAvanzados() {
        this.guardarFiltros();
        this.aplicarFiltros();
        this.filtrosAvanzadosAbierto = false;
    }
    restablecerFiltros() {
        this.categoriaSeleccionada = '';
        this.precioSeleccionado = '';
        this.disponibilidadSeleccionada = '';
        this.orden = 'relevancia';
        this.guardarFiltros();
        this.aplicarFiltros();
    }
    aplicarFiltros() {
        let resultado = [...this.productos()];
        if (this.busqueda.trim() !== '') {
            resultado = resultado.filter(p => p.product_name.toLowerCase().includes(this.busqueda.toLowerCase()) ||
                p.description.toLowerCase().includes(this.busqueda.toLowerCase()));
        }
        if (this.categoriaSeleccionada) {
            const selected = this.categoriaSeleccionada.toLowerCase();
            resultado = resultado.filter(p => (p.categories ?? []).some(category => category.toLowerCase() === selected));
        }
        if (this.precioSeleccionado) {
            if (this.precioSeleccionado === '0-50') {
                resultado = resultado.filter(p => p.price < PRICE_FILTERS.LOW_MAX);
            }
            else if (this.precioSeleccionado === '50-100') {
                resultado = resultado.filter(p => p.price >= PRICE_FILTERS.LOW_MAX && p.price < PRICE_FILTERS.MID_MAX);
            }
            else if (this.precioSeleccionado === '100+') {
                resultado = resultado.filter(p => p.price >= PRICE_FILTERS.MID_MAX);
            }
        }
        if (this.disponibilidadSeleccionada === 'in-stock') {
            resultado = resultado.filter(p => p.stock > 0);
        }
        if (this.orden === 'precioAsc') {
            resultado.sort((a, b) => a.price - b.price);
        }
        else if (this.orden === 'precioDesc') {
            resultado.sort((a, b) => b.price - a.price);
        }
        this.productosFiltrados.set(resultado);
    }
    async agregarAlCarrito(producto: ProductCard) {
        await this.cartService.addItem({
            id: producto.product_id ?? 0,
            nombre: producto.product_name,
            descripcion: producto.description,
            precio: producto.price
        });
        this.toast.success(this.languageService.instant('CART.ADDED', { name: producto.product_name }));
    }
}