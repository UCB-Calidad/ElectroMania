import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderService } from '../service/order.service';
import { CartService } from '../../cart/service/cart.service';
import { ProductService } from '../../product/service/product.service';
import { PrismaService } from '../../prisma/service/prisma.service';
import { CartUpdateRequest } from '../../cart/models/CartUpdateRequest.model';
import { CartState } from '../../cart/enums/CartState.enum';
import { OrderStatus } from '../models/order-response.model';
import { OrderGateway } from '../gateway/order.gateway';
import { OrderMapper } from '../mapper/order.mapper';

@Injectable()
export class CancelOrderUseCase {
  logger = new Logger('CancelOrderUseCase');
  constructor(
    private readonly orderService: OrderService,
    private readonly prisma: PrismaService,
    private readonly CartService: CartService,
    private readonly productService: ProductService,
    private readonly orderGateway: OrderGateway,
    private readonly orderMapper: OrderMapper,
  ) {}

  async execute(orderId: number) {
    return await this.prisma.$transaction(async (tx) => {
      const order = await this.getOrder(orderId);
      await this.handleStockRecovery(order, tx);
      await this.markCartAsCanceled(order.cart.id);
      await this.markOrderAsCanceled(orderId);
      this.orderGateway.emitOrderCancelled(
        this.orderMapper.toOrderCancelledEventDto(order),
      );
      return await this.orderService.getById(orderId);
    });
  }

  private async getOrder(orderId: number) {
    const order = await this.orderService.getById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  private async handleStockRecovery(order: any, tx: any): Promise<void> {
    if (order.status === OrderStatus.PAID) {
      await this.recoverPaidOrderStock(order.cart.details, tx);
    } else {
      await this.releasePendingOrderStock(order.cart.details, tx);
    }
  }

  private async recoverPaidOrderStock(details: any[], tx: any): Promise<void> {
    for (const detail of details) {
      await this.productService.recoverReservedQuantity(
        detail.product.product_id,
        detail.quantity,
        tx,
      );
    }
  }

  private async releasePendingOrderStock(
    details: any[],
    tx: any,
  ): Promise<void> {
    for (const detail of details) {
      await this.productService.releaseReservedStock(
        detail.product.product_id,
        detail.quantity,
        tx,
      );
    }
  }

  private async markCartAsCanceled(cartId: number): Promise<void> {
    const updateCart: CartUpdateRequest = {
      id: cartId,
      state: CartState.CANCELED,
    };
    await this.CartService.updateCart(cartId, updateCart);
  }

  private async markOrderAsCanceled(orderId: number): Promise<void> {
    await this.orderService.update(orderId, {
      status: OrderStatus.CANCELED,
    });
  }
}
