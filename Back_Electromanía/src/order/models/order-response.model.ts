import { OrderItem } from '@prisma/client';
import { CartResponseModel } from '../../cart/models/cart.model';
export class OrderResponseModel {
  id: number;
  user: OrderUserModel;
  total: number;
  status: string;
  createdAt: Date;
  cart: CartResponseModel;
}

export class OrderReceiptModel {
  order_id: number;
  status: {
    translate: string;
    value: string;
  };
  total: number;
  created_at: string;
  user: OrderReceiptUserModel;
  orderItems: OrderItem[];
  payment: {
    method: {
      translate: string;
      value: string;
    };
    status: {
      translate: string;
      value: string;
    };
    amount: number;
  } | null;
}

export class OrderUserModel {
  uuid: string;
  name: string;
  email: string;
}

export class OrderReceiptUserModel {
  uuid: string;
  name: string;
  email: string;
  nit_ci: string;
  social_reason: string;
  phone_number: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}
