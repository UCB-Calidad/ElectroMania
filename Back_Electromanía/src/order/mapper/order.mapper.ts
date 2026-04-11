import { Prisma } from '@prisma/client';
import { CreateOrderDto } from '../dto/create-order.dto';
import {
  OrderReceiptModel,
  OrderResponseModel,
  OrderStatus,
} from '../models/order-response.model';
import { CartMapper } from '../../cart/mapper/cart.mapper';
import {
  OrderCancelledEventDto,
  OrderCreatedEventDto,
  OrderUpdatedEventDto,
} from '../dto/order-event.dto';
type OrderWithUserOrdersAndCart = Prisma.OrderGetPayload<{
  include: {
    userOrders: {
      include: {
        user: true;
      };
    };
    cart: {
      include: {
        cartDetails: {
          include: {
            product: true;
          };
        };
      };
    };
  };
}>;

type OrderForReceipt = Prisma.OrderGetPayload<{
  include: {
    orderItems: true;
    payment: true;
    cart: {
      include: {
        user: {
          omit: {
            password: true;
          };
        };
      };
    };
  };
}>;
export class OrderMapper {
  private readonly cartMapper = new CartMapper();
  toRegisterEntity(CreateOrderSto: CreateOrderDto): Prisma.OrderCreateInput {
    const response: Prisma.OrderCreateInput = {
      userOrders: {
        create: {
          user_uuid: CreateOrderSto.user_uuid,
        },
      },
      cart: {
        connect: {
          cart_id: CreateOrderSto.cart.id,
        },
      },
      total: CreateOrderSto.cart.total,
    };
    return response;
  }
  toResponseModel(entity: OrderWithUserOrdersAndCart): OrderResponseModel {
    const user = entity.userOrders[0].user;
    const response: OrderResponseModel = {
      id: entity.order_id,
      user: {
        uuid: user.uuid,
        name: user.name,
        email: user.email,
      },
      total: Number(entity.total),
      status: entity.status,
      createdAt: entity.created_at,
      cart: this.cartMapper.toOrderModel(entity.cart),
    };
    return response;
  }
  toOrderReceiptModel(entity: OrderForReceipt): OrderReceiptModel {
    let orderStatus;
    if (entity.status === 'PENDING') {
      orderStatus = 'Pendiente';
    } else if (entity.status === 'PAID') {
      orderStatus = 'Pagado';
    } else if (entity.status === 'CANCELED') {
      orderStatus = 'Cancelado';
    } else if (entity.status === 'SHIPPED') {
      orderStatus = 'Enviado';
    } else if (entity.status === 'DELIVERED') {
      orderStatus = 'Entregado';
    }
    let paymentMethod;
    let paymentStatus;
    if (entity.payment) {
      if (entity.payment.method === 'CASH') {
        paymentMethod = 'Efectivo';
      }
      if (entity.payment.status === 'PENDING') {
        paymentStatus = 'Pendiente';
      } else if (entity.payment.status === 'PAID') {
        paymentStatus = 'Pagado';
      } else if (entity.payment.status === 'CANCELED') {
        paymentStatus = 'Cancelado';
      }
    }
    const response: OrderReceiptModel = {
      order_id: entity.order_id,
      status: {
        translate: orderStatus,
        value: entity.status,
      },
      total: Number(entity.total),
      created_at: entity.created_at.toISOString(),
      user: {
        uuid: entity.cart.user.uuid,
        name: entity.cart.user.name,
        email: entity.cart.user.email,
        phone_number: entity.cart.user.phone_number,
        nit_ci: entity.cart.user.nit_ci,
        social_reason: entity.cart.user.social_reason,
      },
      orderItems: entity.orderItems,
      payment: entity.payment
        ? {
            method: {
              translate: paymentMethod,
              value: entity.payment.method,
            },
            status: {
              translate: paymentStatus,
              value: entity.payment.status,
            },
            amount: Number(entity.payment.amount),
          }
        : null,
    };
    return response;
  }
  toOrderCreatedEventDto(entity: OrderResponseModel): OrderCreatedEventDto {
    const response: OrderCreatedEventDto = {
      order_id: entity.id,
      user: {
        uuid: entity.user.uuid,
        name: entity.user.name,
        email: entity.user.email,
      },
      total: entity.total,
      status: OrderStatus[entity.status],
      createdAt: entity.createdAt.toISOString(),
    };
    return response;
  }
  toOrderUpdatedEventDto(entity: OrderResponseModel): OrderUpdatedEventDto {
    const response: OrderUpdatedEventDto = {
      order_id: entity.id,
      user: {
        uuid: entity.user.uuid,
        name: entity.user.name,
        email: entity.user.email,
      },
      total: entity.total,
      status: OrderStatus[entity.status],
      updatedAt: new Date().toISOString(),
    };
    return response;
  }
  toOrderCancelledEventDto(
    entity: OrderResponseModel,
    reason?: string,
  ): OrderCancelledEventDto {
    const response: OrderCancelledEventDto = {
      order_id: entity.id,
      user: {
        uuid: entity.user.uuid,
        name: entity.user.name,
        email: entity.user.email,
      },
      status: OrderStatus.CANCELED,
      reason: reason,
      total: entity.total,
      cancelledAt: new Date().toISOString(),
    };
    return response;
  }
}
