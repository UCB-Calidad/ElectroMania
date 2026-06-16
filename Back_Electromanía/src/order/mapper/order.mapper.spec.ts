import { beforeEach, describe, expect, it } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { OrderMapper } from './order.mapper';
import { Prisma, OrderStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/client";

describe("OrderMapper", () => {
    let orderMapper: OrderMapper;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [OrderMapper]
        }).compile();
        orderMapper = module.get<OrderMapper>(OrderMapper);
    });

    const orderEntity = {
        order_id: 1,
        total: new Decimal(100),
        status: OrderStatus.PENDING,
        created_at: new Date(),
        userOrders: [
            {
                user: {
                    uuid: "123e4567-e89b-12d3-a456-426614174000",
                    name: "Juan",
                    email: "juan@gmail.com"
                }
            }
        ],
        cart: {
            cart_id: 1,
            user_uuid: "123e4567-e89b-12d3-a456-426614174000",
            cartDetails: []
        }
    };

    describe("Mapear a un modelo de respuesta", () => {
        it("Deberia mapear una entidad de orden a un modelo de respuesta", () => {
            const result = orderMapper.toResponseModel(orderEntity as any);
            expect(result).toBeDefined();
            expect(result.id).toBe(orderEntity.order_id);
            expect(result.total).toBe(100);
            expect(result.status).toBe(OrderStatus.PENDING);
        });
    });

    describe("toRegisterEntity", () => {
        it("Deberia mapear a Prisma OrderCreateInput", () => {
            const createOrderDto = {
                user_uuid: "123e4567-e89b-12d3-a456-426614174000",
                cart: { id: 1, total: 100 }
            };
            const result = orderMapper.toRegisterEntity(createOrderDto as any);
            expect(result).toBeDefined();
            expect(result.userOrders).toBeDefined();
            expect(result.cart).toBeDefined();
            expect(result.total).toBe(100);
        });
    });

    describe("Mapear a un modelo de receipt", () => {
        it("Deberia mapear una entidad de orden a un modelo de receipt", () => {
            const orderForReceipt = {
                order_id: 1,
                total: new Decimal(100),
                status: OrderStatus.PENDING,
                created_at: new Date(),
                orderItems: [],
                payment: null,
                cart: {
                    user: {
                        uuid: "123e4567-e89b-12d3-a456-426614174000",
                        name: "Juan",
                        email: "juan@gmail.com",
                        phone_number: "123456789",
                        nit_ci: "123456789",
                        social_reason: "Juan S.A."
                    }
                }
            };
            const result = orderMapper.toOrderReceiptModel(orderForReceipt as any);
            expect(result).toBeDefined();
            expect(result.order_id).toBe(1);
        });

        it("Deberia mapear receipt con estado PAID", () => {
            const orderForReceipt = {
                order_id: 1,
                total: new Decimal(100),
                status: OrderStatus.PAID,
                created_at: new Date(),
                orderItems: [],
                payment: { method: "CASH", status: "PAID", amount: new Decimal(100) },
                cart: {
                    user: {
                        uuid: "123e4567-e89b-12d3-a456-426614174000",
                        name: "Juan",
                        email: "juan@gmail.com",
                        phone_number: "123456789",
                        nit_ci: "123456789",
                        social_reason: "Juan S.A."
                    }
                }
            };
            const result = orderMapper.toOrderReceiptModel(orderForReceipt as any);
            expect(result).toBeDefined();
            expect(result.status.value).toBe(OrderStatus.PAID);
        });

        it("Deberia mapear receipt con estado CANCELED", () => {
            const orderForReceipt = {
                order_id: 1,
                total: new Decimal(100),
                status: OrderStatus.CANCELED,
                created_at: new Date(),
                orderItems: [],
                payment: null,
                cart: {
                    user: {
                        uuid: "123e4567-e89b-12d3-a456-426614174000",
                        name: "Juan",
                        email: "juan@gmail.com",
                        phone_number: "123456789",
                        nit_ci: "123456789",
                        social_reason: "Juan S.A."
                    }
                }
            };
            const result = orderMapper.toOrderReceiptModel(orderForReceipt as any);
            expect(result).toBeDefined();
            expect(result.status.value).toBe(OrderStatus.CANCELED);
        });

        it("Deberia mapear receipt con estado SHIPPED", () => {
            const orderForReceipt = {
                order_id: 1,
                total: new Decimal(100),
                status: OrderStatus.SHIPPED,
                created_at: new Date(),
                orderItems: [],
                payment: { method: "CASH", status: "PAID", amount: new Decimal(100) },
                cart: {
                    user: {
                        uuid: "123e4567-e89b-12d3-a456-426614174000",
                        name: "Juan",
                        email: "juan@gmail.com",
                        phone_number: "123456789",
                        nit_ci: "123456789",
                        social_reason: "Juan S.A."
                    }
                }
            };
            const result = orderMapper.toOrderReceiptModel(orderForReceipt as any);
            expect(result).toBeDefined();
            expect(result.status.value).toBe(OrderStatus.SHIPPED);
        });

        it("Deberia mapear receipt con estado DELIVERED", () => {
            const orderForReceipt = {
                order_id: 1,
                total: new Decimal(100),
                status: OrderStatus.DELIVERED,
                created_at: new Date(),
                orderItems: [],
                payment: { method: "CASH", status: "PAID", amount: new Decimal(100) },
                cart: {
                    user: {
                        uuid: "123e4567-e89b-12d3-a456-426614174000",
                        name: "Juan",
                        email: "juan@gmail.com",
                        phone_number: "123456789",
                        nit_ci: "123456789",
                        social_reason: "Juan S.A."
                    }
                }
            };
            const result = orderMapper.toOrderReceiptModel(orderForReceipt as any);
            expect(result).toBeDefined();
            expect(result.status.value).toBe(OrderStatus.DELIVERED);
        });

        it("Deberia mapear receipt con pago cancelado", () => {
            const orderForReceipt = {
                order_id: 1,
                total: new Decimal(100),
                status: OrderStatus.PAID,
                created_at: new Date(),
                orderItems: [],
                payment: { method: "CASH", status: "CANCELED", amount: new Decimal(100) },
                cart: {
                    user: {
                        uuid: "123e4567-e89b-12d3-a456-426614174000",
                        name: "Juan",
                        email: "juan@gmail.com",
                        phone_number: "123456789",
                        nit_ci: "123456789",
                        social_reason: "Juan S.A."
                    }
                }
            };
            const result = orderMapper.toOrderReceiptModel(orderForReceipt as any);
            expect(result).toBeDefined();
            expect(result.payment).toBeDefined();
            expect(result.payment?.status.translate).toBe("Cancelado");
        });

        it("Deberia mapear receipt con pago pendiente", () => {
            const orderForReceipt = {
                order_id: 1,
                total: new Decimal(100),
                status: OrderStatus.PENDING,
                created_at: new Date(),
                orderItems: [],
                payment: { method: "CASH", status: "PENDING", amount: new Decimal(100) },
                cart: {
                    user: {
                        uuid: "123e4567-e89b-12d3-a456-426614174000",
                        name: "Juan",
                        email: "juan@gmail.com",
                        phone_number: "123456789",
                        nit_ci: "123456789",
                        social_reason: "Juan S.A."
                    }
                }
            };
            const result = orderMapper.toOrderReceiptModel(orderForReceipt as any);
            expect(result).toBeDefined();
            expect(result.payment).toBeDefined();
            expect(result.payment?.status.translate).toBe("Pendiente");
        });

        it("Deberia mapear receipt con metodo de pago no efectivo", () => {
            const orderForReceipt = {
                order_id: 1,
                total: new Decimal(100),
                status: OrderStatus.PAID,
                created_at: new Date(),
                orderItems: [],
                payment: { method: "CARD", status: "PAID", amount: new Decimal(100) },
                cart: {
                    user: {
                        uuid: "123e4567-e89b-12d3-a456-426614174000",
                        name: "Juan",
                        email: "juan@gmail.com",
                        phone_number: "123456789",
                        nit_ci: "123456789",
                        social_reason: "Juan S.A."
                    }
                }
            };
            const result = orderMapper.toOrderReceiptModel(orderForReceipt as any);
            expect(result).toBeDefined();
            expect(result.payment).toBeDefined();
            expect(result.payment?.method.translate).toBeUndefined();
        });

        it("Deberia mapear receipt sin pago", () => {
            const orderForReceipt = {
                order_id: 1,
                total: new Decimal(100),
                status: OrderStatus.PENDING,
                created_at: new Date(),
                orderItems: [],
                payment: null,
                cart: {
                    user: {
                        uuid: "123e4567-e89b-12d3-a456-426614174000",
                        name: "Juan",
                        email: "juan@gmail.com",
                        phone_number: "123456789",
                        nit_ci: "123456789",
                        social_reason: "Juan S.A."
                    }
                }
            };
            const result = orderMapper.toOrderReceiptModel(orderForReceipt as any);
            expect(result).toBeDefined();
            expect(result.payment).toBeNull();
        });
    });

    describe("Mapear a evento de orden creada", () => {
        it("Deberia mapear a OrderCreatedEventDto", () => {
            const responseModel = {
                id: 1,
                user: { uuid: "123", name: "Juan", email: "juan@gmail.com" },
                total: 100,
                status: OrderStatus.PENDING,
                createdAt: new Date()
            };
            const result = orderMapper.toOrderCreatedEventDto(responseModel as any);
            expect(result).toBeDefined();
            expect(result.order_id).toBe(1);
        });
    });

    describe("Mapear a evento de orden actualizada", () => {
        it("Deberia mapear a OrderUpdatedEventDto", () => {
            const responseModel = {
                id: 1,
                user: { uuid: "123", name: "Juan", email: "juan@gmail.com" },
                total: 100,
                status: OrderStatus.PENDING,
                createdAt: new Date()
            };
            const result = orderMapper.toOrderUpdatedEventDto(responseModel as any);
            expect(result).toBeDefined();
            expect(result.order_id).toBe(1);
        });
    });

    describe("Mapear a evento de orden cancelada", () => {
        it("Deberia mapear a OrderCancelledEventDto", () => {
            const responseModel = {
                id: 1,
                user: { uuid: "123", name: "Juan", email: "juan@gmail.com" },
                total: 100,
                status: OrderStatus.PENDING,
                createdAt: new Date()
            };
            const result = orderMapper.toOrderCancelledEventDto(responseModel as any, "User requested");
            expect(result).toBeDefined();
            expect(result.order_id).toBe(1);
            expect(result.reason).toBe("User requested");
        });
    });
});