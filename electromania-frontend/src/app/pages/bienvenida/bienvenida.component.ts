import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductCard } from '../../models';
import { ProductosService } from '../../services/productos.service';
import { DraggableScrollDirective } from '../../directives/draggable-scroll.directive';
import { TranslateModule } from '@ngx-translate/core';
@Component({
    selector: 'app-bienvenida',
    standalone: true,
    imports: [ProductCardComponent, DraggableScrollDirective, TranslateModule],
    templateUrl: './bienvenida.component.html',
    styleUrls: ['./bienvenida.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BienvenidaComponent implements OnInit, AfterViewInit {
    private readonly router = inject(Router);
    private readonly productosService = inject(ProductosService);
    @ViewChild('ofertasList', { static: true })
    ofertasList!: ElementRef<HTMLDivElement>;
    @ViewChild('destacadosList', { static: true })
    destacadosList!: ElementRef<HTMLDivElement>;
    @ViewChild('heroSection')
    heroSection!: ElementRef<HTMLElement>;
    ofertasAbiertas = signal(true);
    backgroundLoaded = signal(false);
    loading = signal(false);
    productosDestacados = signal<ProductCard[]>([]);
    productosOferta = signal<ProductCard[]>([]);
    ngOnInit() {
        this.checkBackgroundImage();
        this.cargarProductos();
    }
    ngAfterViewInit() {
        setTimeout(() => {
            this.checkBackgroundImage();
        }, 500);
    }
    async cargarProductos() {
        this.loading.set(true);
        try {
            const products = await this.productosService.getAllProducts();
            const cards = this.productosService.toProductCards(products);
            this.productosDestacados.set(cards.slice(0, 6));
            this.productosOferta.set(cards.slice(6, 12).map(p => ({ ...p, isOffer: true })));
        }
        catch {
            this.productosDestacados.set([]);
            this.productosOferta.set([]);
        }
        finally {
            this.loading.set(false);
        }
    }
    checkBackgroundImage() {
        const imgUrl = '/bienvenidafondo.png';
        const img = new Image();
        if (this.backgroundLoaded() && this.heroSection?.nativeElement) {
            this.applyBackground(this.heroSection.nativeElement, imgUrl);
            return;
        }
        img.onload = () => {
            this.backgroundLoaded.set(true);
            if (this.heroSection?.nativeElement) {
                this.applyBackground(this.heroSection.nativeElement, imgUrl);
                this.heroSection.nativeElement.classList.remove('fallback-bg');
            }
        };
        img.onerror = () => {
            this.backgroundLoaded.set(false);
            if (this.heroSection?.nativeElement) {
                this.heroSection.nativeElement.classList.add('fallback-bg');
            }
        };
        img.src = imgUrl;
    }
    applyBackground(element: HTMLElement, url: string) {
        element.style.backgroundImage = `url('${url}')`;
        element.style.backgroundPosition = 'center';
        element.style.backgroundSize = 'cover';
        element.style.backgroundRepeat = 'no-repeat';
    }
    irATienda() {
        this.router.navigate(['/home']);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    verDetalles(producto: ProductCard) {
        if (producto.product_id) {
            this.router.navigate(['/detalle-producto', producto.product_id]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    toggleOfertas() {
        this.ofertasAbiertas.update(v => !v);
    }
    setDefaultImage(event: Event) {
        const img = event.target as HTMLImageElement;
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMwYjE2MjIiLz48cGF0aCBkPSJNMTUwIDEwMEwxMDAgMTUwTDE1MCAyMDBMMjAwIDE1MEwxNTAgMTAwWiIgZmlsbD0iIzAwZjJmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5Qcm9kdWN0byBObyBEaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';
    }
    getPrecioConDescuento(producto: ProductCard): number {
        if (producto.isOffer) {
            return producto.price * 0.85;
        }
        return producto.price;
    }
}