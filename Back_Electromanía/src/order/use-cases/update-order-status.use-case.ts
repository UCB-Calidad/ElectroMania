import { Injectable, Logger } from '@nestjs/common';
import { ConfirmPaymentForOrderUseCase } from './confirm-payment-for-order.use-case';
import { UpdateOrderModel } from '../dto/update-order.dto';
import { OrderStatus } from '../models/order-response.model';
import { CancelOrderUseCase } from './cancel-order.use-case';
import { OrderGateway } from '../gateway/order.gateway';
import { OrderMapper } from '../mapper/order.mapper';

@Injectable()
export class UpdateOrderStatusUseCase {
  logger = new Logger(UpdateOrderStatusUseCase.name);
  constructor(
    private readonly confirmPayment: ConfirmPaymentForOrderUseCase,
    private readonly cancelOrder: CancelOrderUseCase,
    private readonly orderGateway: OrderGateway,
    private readonly orderMapper: OrderMapper,
  ) {}
  async execute(orderId: number, updateOrderDto: UpdateOrderModel) {
    if (updateOrderDto.status === OrderStatus.PAID) {
      await this.confirmPayment.execute(orderId);
    } else if (updateOrderDto.status === OrderStatus.CANCELED) {
      await this.cancelOrder.execute(orderId);
    }
  }
}
