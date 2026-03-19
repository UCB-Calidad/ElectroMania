import { Component, inject, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../../services/toast.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { LanguageService } from '../../services/language.service';
import { ProductosService } from '../../services/productos.service';
import { UserService } from '../../services/user.service';
import { CONTACT, ROUTES } from '../../constants';
@Component({
    selector: 'app-productos',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './productos.component.html',
    styleUrls: ['./productos.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductosComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly toast = inject(ToastService);
    private readonly authService = inject(AuthService);
    private readonly orderService = inject(OrderService);
    private readonly languageService = inject(LanguageService);
    private readonly productosService = inject(ProductosService);
    protected readonly cartService = inject(CartService);
    private readonly userService = inject(UserService);
    readonly isAuthenticated = this.authService.isAuthenticated$;
    readonly currentUser = this.authService.currentUser;
    readonly carrito = this.cartService.items;
    readonly totals = this.cartService.totals;
    readonly isEmpty = this.cartService.isEmpty;
    nombreFactura = signal('');
    nitFactura = signal('');
    emailFactura = signal('');
    procesando = signal(false);
    mostrarModalExito = signal(false);
    numeroFactura = signal('');
    private readonly productStocks = signal<Map<number, number>>(new Map());
    ngOnInit(): void {
        void this.initializePageData();
    }
    private async initializePageData(): Promise<void> {
        await this.autoFillUserData();
        await this.loadProductStocks();
    }
    private async loadProductStocks() {
        try {
            const products = await this.productosService.getAllProducts();
            const stockMap = new Map<number, number>();
            products.forEach(p => {
                if (p.product_id !== undefined) {
                    stockMap.set(p.product_id, p.stock);
                }
            });
            this.productStocks.set(stockMap);
        }
        catch {
            console.error('Failed to load product stocks');
        }
    }
    getMaxStock(productId: number): number {
        return this.productStocks().get(productId) ?? 999;
    }
    isAtMaxStock(productId: number, currentQuantity: number): boolean {
        const maxStock = this.getMaxStock(productId);
        return currentQuantity >= maxStock;
    }
    private async autoFillUserData() {
        if (!this.isAuthenticated())
            return;
        try {
            const user = await this.userService.getCurrentUser();
            this.applyUserFields(user?.email, user?.social_reason || user?.name, user?.nit_ci);
        }
        catch {
            const jwtUser = this.currentUser();
            this.applyUserFields(jwtUser?.email, jwtUser?.nombre);
        }
    }
    private applyUserFields(email?: string | null, name?: string | null, nit?: string | null) {
        if (email) {
            this.emailFactura.set(email);
        }
        if (name) {
            this.nombreFactura.set(name);
        }
        if (nit) {
            this.nitFactura.set(nit);
        }
    }
    irACatalogo() {
        this.router.navigate(['/', ROUTES.HOME]);
    }
    irACarrito() {
        this.router.navigate(['/', ROUTES.PRODUCTO]);
    }
    irALogin() {
        this.router.navigate(['/', ROUTES.LOGIN]);
    }
    volverATienda() {
        this.mostrarModalExito.set(false);
        this.cartService.clear();
        this.router.navigate(['/', ROUTES.HOME]);
    }
    async aumentarCantidad(productId: number) {
        const item = this.carrito().find(i => i.id === productId);
        if (item) {
            const maxStock = this.getMaxStock(productId);
            if (item.cantidad >= maxStock) {
                return;
            }
            await this.cartService.increaseQuantity(item.id, maxStock);
        }
    }
    async disminuirCantidad(index: number) {
        const item = this.carrito().find(i => i.id === index);
        if (item) {
            await this.cartService.decreaseQuantity(item.id);
        }
    }
    async eliminarProducto(product_id: number) {
        const item = this.carrito().find(i => i.id === product_id);
        if (item) {
            await this.cartService.removeItem(item.id);
        }
    }
    async procesarPago() {
        if (this.procesando())
            return;
        if (this.isEmpty()) {
            this.toast.error(this.languageService.instant('CHECKOUT.EMPTY_CART'));
            return;
        }
        if (!this.nombreFactura() || !this.nitFactura()) {
            this.toast.warning(this.languageService.instant('CHECKOUT.REQUIRED_FIELDS'));
            return;
        }
        this.procesando.set(true);
        try {
            if (this.isAuthenticated()) {
                const order = await this.orderService.createOrderFromCart();
                this.numeroFactura.set(`PED-${order.id ?? order.order_id}`);
            }
            else {
                this.numeroFactura.set(`PED-${crypto.randomUUID().slice(0, 8).toUpperCase()}`);
            }
            const whatsappMessage = this.generateWhatsAppMessage();
            const whatsappUrl = this.generateWhatsAppUrl(whatsappMessage);
            window.open(whatsappUrl, '_blank');
            this.mostrarModalExito.set(true);
        }
        catch (error) {
            console.error('Error creating order:', error);
            this.toast.error(this.languageService.instant('CHECKOUT.ORDER_ERROR'));
        }
        finally {
            this.procesando.set(false);
        }
    }
    private generateWhatsAppMessage(): string {
        const items = this.carrito();
        const totales = this.totals();
        const productList = items.map(item => `- ${item.nombre} x${item.cantidad} = ${this.languageService.instant('CART.BS')} ${(item.precio * item.cantidad).toFixed(2)}`).join('\n');
        const emailLine = this.emailFactura()
            ? this.languageService.instant('CHECKOUT.WHATSAPP_EMAIL', { email: this.emailFactura() })
            : '';
        const message = this.languageService.instant('CHECKOUT.WHATSAPP_MESSAGE', {
            productList,
            subtotal: totales.subtotal.toFixed(2),
            impuestos: totales.impuestos.toFixed(2),
            total: totales.total.toFixed(2),
            nombre: this.nombreFactura(),
            nit: this.nitFactura(),
            emailLine
        });
        return message;
    }
    private generateWhatsAppUrl(message: string): string {
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${CONTACT.WHATSAPP_NUMBER}?text=${encodedMessage}`;
    }
}
