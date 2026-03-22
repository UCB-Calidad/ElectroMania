import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastService } from '../../services/toast.service';
import { ProductosService } from '../../services/productos.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models';
interface ProductDetail {
    id: number;
    nombre: string;
    categoria: string;
    precio: number;
    stock: number;
    descripcionCorta: string;
    imagen: string;
    oferta?: boolean;
    descuento?: number;
    datasheet?: string;
    libreria?: string;
    especificaciones?: {
        label: string;
        valor: string;
    }[];
}
@Component({
    selector: 'app-detalle-producto',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './detalle-producto.component.html',
    styleUrl: './detalle-producto.component.css'
})
export class DetalleProductoComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly toast = inject(ToastService);
    private readonly productosService = inject(ProductosService);
    private readonly cartService = inject(CartService);
    private readonly translate = inject(TranslateService);
    total_items = 0;
    cantidadSeleccionada = 1;
    mensajeStock = signal('');
    idRecibido: string | null = null;
    loading = signal(false);
    producto = signal<ProductDetail | null>(null);
    ngOnInit() {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.idRecibido = idParam;
            this.cargarDatosDelProducto(Number.parseInt(idParam));
        }
    }
    async cargarDatosDelProducto(id: number) {
        this.loading.set(true);
        try {
            const apiProduct = await this.productosService.getProductById(id);
            if (!apiProduct) {
                this.toast.error(this.translate.instant('PRODUCTS.NOT_FOUND'));
                this.router.navigate(['/home']);
                return;
            }
            this.producto.set(this.mapToProductDetail(apiProduct));
            this.actualizarMensajeStock();
        }
        catch (error) {
            console.error('Error loading product:', error);
            this.toast.error(this.translate.instant('PRODUCTS.NOT_FOUND'));
            this.router.navigate(['/home']);
        }
        finally {
            this.loading.set(false);
        }
    }
    private mapToProductDetail(p: Product): ProductDetail {
        return {
            id: p.product_id ?? 0,
            nombre: p.product_name,
            categoria: this.translate.instant('PRODUCT_DETAIL.GENERAL_CATEGORY'),
            precio: p.price,
            stock: p.stock,
            descripcionCorta: p.description,
            imagen: p.images?.at(-1) ?? '/placeholder.png',
            datasheet: this.translate.instant('PRODUCT_DETAIL.DATASHEET_URL'),
            libreria: this.translate.instant('PRODUCT_DETAIL.LIBRARY_URL'),
            especificaciones: [
                { label: this.translate.instant('PRODUCT_DETAIL.SPEC_VOLTAGE'), valor: '3.3V - 5V' },
                { label: this.translate.instant('PRODUCT_DETAIL.SPEC_USAGE'), valor: this.translate.instant('PRODUCT_DETAIL.SPEC_USAGE_VALUE') }
            ]
        };
    }
    actualizarMensajeStock() {
        const producto = this.producto();
        if (!producto)
            return;
        if (producto.stock === 0) {
            this.mensajeStock.set(this.translate.instant('PRODUCT_DETAIL.STOCK_OUT'));
        }
        else if (producto.stock < 10) {
            this.mensajeStock.set(this.translate.instant('PRODUCT_DETAIL.STOCK_LOW', { count: producto.stock }));
        }
        else {
            this.mensajeStock.set(this.translate.instant('PRODUCT_DETAIL.STOCK_AVAILABLE'));
        }
    }
    obtenerClaseStock() {
        const producto = this.producto();
        if (!producto || producto.stock === 0)
            return 'stock-agotado';
        if (producto.stock < 10)
            return 'stock-bajo';
        return 'stock-disponible';
    }
    modificarCantidad(valor: number) {
        const nuevaCant = this.cantidadSeleccionada + valor;
        if (nuevaCant >= 1 && nuevaCant <= (this.producto()?.stock || 1)) {
            this.cantidadSeleccionada = nuevaCant;
        }
    }
    async agregarAlCarrito() {
        const producto = this.producto();
        if (!producto)
            return;
        await this.cartService.addItem({
            id: producto.id,
            nombre: producto.nombre,
            descripcion: producto.descripcionCorta,
            precio: producto.precio
        }, this.cantidadSeleccionada);
        this.toast.success(this.translate.instant('CART.ADDED', { name: producto.nombre }));
    }
    setDefaultImage(_event: Event) {
        const producto = this.producto();
        if (!producto)
            return;
        this.producto.set({ ...producto, imagen: 'https://via.placeholder.com/500' });
    }
}