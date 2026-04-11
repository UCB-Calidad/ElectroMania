import { OrderService } from '../service/order.service';
import { CartService } from '../../cart/service/cart.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/service/prisma.service';
import { ProductService } from '../../product/service/product.service';
import { OrderGateway } from '../gateway/order.gateway';
import { OrderMapper } from '../mapper/order.mapper';

@Injectable()
export class CreateOrderByCartUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService,
    private readonly orderService: OrderService,
    private readonly cartService: CartService,
    private readonly orderGateway: OrderGateway,
    private readonly orderMapper: OrderMapper,
  ) {}
  async execute(userUuid: string) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await this.cartService.getActiveCartByUser(userUuid, tx);
      if (!cart) {
        throw new NotFoundException('Cart active not found');
      }
      if (cart.details.length === 0) {
        throw new NotFoundException('Cart is empty');
      }
      cart.details.forEach((detail) => {
        this.productService.checkStock(
          detail.product.product_id,
          detail.quantity,
          tx,
        );
      });
      await this.cartService.updateCart(cart.id, {
        id: cart.id,
        state: 'RESERVED',
      });
      const order = await this.orderService.register(userUuid, cart, tx);
      await this.orderService.saveOrderItems(cart, order.id, tx);
      this.orderGateway.emitOrderCreated(
        this.orderMapper.toOrderCreatedEventDto(order),
      );
      return order;
    });
  }
}
