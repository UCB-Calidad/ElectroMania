import { OrderStatus } from '../models/order-response.model';

export class UpdateOrderDto {
  orderId: number;
  status: string;
}

export class UpdateOrderModel {
  status: OrderStatus;

  constructor(status: string) {
    this.status = OrderStatus[status];
  }
}
