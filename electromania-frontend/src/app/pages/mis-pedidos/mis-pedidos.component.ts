import { Component, ElementRef, HostListener, OnDestroy, OnInit, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OrderService } from '../../services/order.service';
import { ModalService } from '../../services/modal.service';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal.component';
import { Order } from '../../models';
import { ToastService } from '../../services/toast.service';
import { API } from '../../constants';
import DOMPurify from 'dompurify';
@Component({
    selector: 'app-mis-pedidos',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule, ConfirmationModalComponent],
    templateUrl: './mis-pedidos.component.html',
    styleUrl: './mis-pedidos.component.css'
})
export class MisPedidosComponent implements OnInit, OnDestroy {
    private readonly orderService = inject(OrderService);
    private readonly translate = inject(TranslateService);
    private readonly modalService = inject(ModalService);
    private readonly toast = inject(ToastService);
    private mobileHandoffInProgress = false;
    private readonly receiptFrame = viewChild<ElementRef<HTMLIFrameElement>>('receiptFrame');
    orders = signal<Order[]>([]);
    loading = signal(true);
    receiptModalOpen = signal(false);
    receiptLoading = signal(false);
    receiptReady = signal(false);
    currentReceiptOrderId = signal<number | null>(null);
    ngOnInit() {
        this.loadOrders();
    }
    ngOnDestroy(): void {
        this.unlockBodyScroll();
    }
    @HostListener('document:keydown.escape')
    onEscapeKeyDown(): void {
        if (this.receiptModalOpen()) {
            this.closeReceiptModal();
        }
    }
    @HostListener('window:resize')
    onWindowResize(): void {
        if (this.mobileHandoffInProgress) {
            return;
        }
        if (!this.receiptModalOpen()) {
            return;
        }
        const currentOrderId = this.currentReceiptOrderId();
        if (currentOrderId == null) {
            return;
        }
        const isMobileView = globalThis.matchMedia('(max-width: 900px)').matches;
        if (!isMobileView) {
            return;
        }
        this.mobileHandoffInProgress = true;
        this.openReceiptInNewTab(currentOrderId);
        this.closeReceiptModal();
        this.toast.info(this.translate.instant('MY_ORDERS.RECEIPT_OPENED_MOBILE'));
        setTimeout(() => {
            this.mobileHandoffInProgress = false;
        }, 300);
    }
    async loadOrders() {
        this.loading.set(true);
        try {
            this.orders.set(await this.orderService.getMyOrders());
        }
        catch {
            console.error('Error loading orders');
        }
        finally {
            this.loading.set(false);
        }
    }
    getStatusLabel(status: string): string {
        return this.orderService.getStatusLabel(status);
    }
    getStatusClass(status: string): string {
        return this.orderService.getStatusClass(status);
    }
    formatDate(dateString?: string): string {
        if (!dateString) {
            return this.translate.instant('COMMON.NOT_AVAILABLE');
        }
        const parsedDate = new Date(dateString);
        if (Number.isNaN(parsedDate.getTime())) {
            return this.translate.instant('COMMON.NOT_AVAILABLE');
        }
        return parsedDate.toLocaleDateString('es-BO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    formatCurrency(amount: number): string {
        return `${this.translate.instant('CART.BS')} ${amount.toFixed(2)}`;
    }
    async viewReceipt(orderId: number): Promise<void> {
        const isMobileView = globalThis.matchMedia('(max-width: 900px)').matches;
        if (isMobileView) {
            this.openReceiptInNewTab(orderId);
            return;
        }

        this.receiptLoading.set(true);
        this.receiptReady.set(false);
        try {
            const html = await this.orderService.getReceipt(orderId);
            const cleanHtml = DOMPurify.sanitize(html, {
                WHOLE_DOCUMENT: true,
                ADD_ATTR: ['target']
            });

            this.currentReceiptOrderId.set(orderId);
            this.lockBodyScroll();
            this.receiptModalOpen.set(true);
            this.receiptReady.set(true);

            setTimeout(() => {
                const frame = this.receiptFrame();
                if (frame) {
                    frame.nativeElement.srcdoc = cleanHtml;
                }
            });
        }
        catch {
            this.toast.error(this.translate.instant('MY_ORDERS.RECEIPT_ERROR'));
        }
        finally {
            this.receiptLoading.set(false);
        }
    }
    private openReceiptInNewTab(orderId: number): void {
        window.open(`${API.ORDER.RECEIPT}?id=${orderId}`, '_blank', 'noopener,noreferrer');
    }
    closeReceiptModal(): void {
        this.receiptModalOpen.set(false);
        this.receiptReady.set(false);
        this.unlockBodyScroll();
        this.currentReceiptOrderId.set(null);
        this.mobileHandoffInProgress = false;
    }
    private lockBodyScroll(): void {
        document.body.classList.add('no-scroll');
        document.documentElement.style.overflow = 'hidden';
    }
    private unlockBodyScroll(): void {
        document.body.classList.remove('no-scroll');
        document.documentElement.style.overflow = '';
    }
    canViewReceipt(status: string): boolean {
        return status === 'PAID' || status === 'SHIPPED' || status === 'DELIVERED';
    }
    async cancelOrder(orderId: number): Promise<void> {
        const confirmed = await this.modalService.confirm({
            title: this.translate.instant('MY_ORDERS.CANCEL_TITLE'),
            message: this.translate.instant('MY_ORDERS.CONFIRM_CANCEL'),
            confirmText: this.translate.instant('MY_ORDERS.CANCEL'),
            cancelText: this.translate.instant('COMMON.CANCEL'),
            type: 'danger'
        });
        if (!confirmed) {
            return;
        }
        try {
            await this.orderService.cancelOrder(orderId);
            await this.loadOrders();
        }
        catch {
            console.error('Error canceling order');
        }
    }
}