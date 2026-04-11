import { PrismaService } from '../../prisma/service/prisma.service';
import { CartService } from '../../cart/service/cart.service';
import { OrderService } from '../service/order.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CartUpdateRequest } from '../../cart/models/CartUpdateRequest.model';
import { ProductService } from '../../product/service/product.service';
import { OrderStatus } from '../models/order-response.model';
import { PaymentService } from '../../payment/service/payment.service';
import {
  PaymentMethod,
  PaymentStatus,
} from 'src/payment/dto/register-payment.dto';
import { SendOrderReceiptUseCase } from './send-order-receipt.use-case';
import { GenerateOrderXmlUseCase } from './generate-order-xml.usecase';
import { OrderGateway } from '../gateway/order.gateway';
import { OrderMapper } from '../mapper/order.mapper';

@Injectable()
export class ConfirmPaymentForOrderUseCase {
  logger = new Logger('ConfirmPaymentForOrderUseCase');
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
    private readonly paymentService: PaymentService,
    private readonly sendOrderByEmail: SendOrderReceiptUseCase,
    private readonly generateHtml: GenerateOrderXmlUseCase,
    private readonly orderGateway: OrderGateway,
    private readonly orderMapper: OrderMapper,
  ) {}
  async execute(orderId: number) {
    await this.processPaymentTransaction(orderId);
    await this.sendOrderByEmail.execute(orderId);
    return await this.generateHtml.execute(orderId);
  }

  private async processPaymentTransaction(orderId: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      let order = await this.getOrder(orderId);
      await this.confirmProductsSales(order, tx);
      await this.markCartAsCompleted(order.cart.id, tx);
      await this.markOrderAsPaid(orderId, tx);
      await this.createPaymentRecord(orderId, order.total, tx);
      order.status = OrderStatus.PAID;
      this.orderGateway.emitOrderUpdated(
        this.orderMapper.toOrderUpdatedEventDto(order),
      );
    });
  }

  private async getOrder(orderId: number) {
    const order = await this.orderService.getById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  private async confirmProductsSales(order: any, tx: any): Promise<void> {
    await Promise.all(
      order.cart.details.map((detail: any) =>
        this.productService.confirmSale(
          detail.product.product_id,
          detail.quantity,
          tx,
        ),
      ),
    );
  }

  private async markCartAsCompleted(cartId: number, tx: any): Promise<void> {
    const updateCart: CartUpdateRequest = {
      id: cartId,
      state: 'COMPLETED',
    };
    await this.cartService.updateCart(cartId, updateCart, tx);
  }

  private async markOrderAsPaid(orderId: number, tx: any): Promise<void> {
    await this.orderService.update(
      orderId,
      {
        status: OrderStatus.PAID,
      },
      tx,
    );
    this.orderService.clearCachedOrderById(orderId);
  }

  private async createPaymentRecord(
    orderId: number,
    amount: number,
    tx: any,
  ): Promise<void> {
    await this.paymentService.registerPayment(
      orderId,
      {
        orderId: orderId,
        amount: amount,
        method: PaymentMethod.CASH,
        status: PaymentStatus.PAID,
      },
      tx,
    );
  }
}
