import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderByCartUseCase } from './create-order-by-cart.usecase';
import { OrderService } from '../service/order.service';
import { CartService } from '../../cart/service/cart.service';
import { PrismaService } from '../../prisma/service/prisma.service';
import { ProductService } from '../../product/service/product.service';
import { OrderGateway } from '../gateway/order.gateway';
import { OrderMapper } from '../mapper/order.mapper';
import { NotFoundException } from '@nestjs/common';

describe("CreateOrderByCartUseCase", () => {
    let createOrderByCartUseCase: CreateOrderByCartUseCase;
    let mockOrderService: any;
    let mockCartService: any;
    let mockProductService: any;
    let mockPrismaService: any;
    let mockOrderGateway: any;
    let mockOrderMapper: any;

    beforeEach(async () => {
        mockOrderService = {
            register: vi.fn().mockResolvedValue({ order_id: 1 }),
            saveOrderItems: vi.fn().mockResolvedValue({}),
        };
        mockCartService = {
            getActiveCartByUser: vi.fn().mockResolvedValue({ 
                id: 1, 
                details: [{ product: { product_id: 1 }, quantity: 2 }] 
            }),
            updateCart: vi.fn().mockResolvedValue({}),
        };
        mockProductService = {
            checkStock: vi.fn().mockResolvedValue(true),
        };
        mockPrismaService = {
            $transaction: vi.fn((callback) => callback({})),
        };
        mockOrderGateway = {
            emitOrderCreated: vi.fn(),
        };
        mockOrderMapper = {
            toOrderCreatedEventDto: vi.fn().mockReturnValue({ order_id: 1 }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateOrderByCartUseCase,
                { provide: OrderService, useValue: mockOrderService },
                { provide: CartService, useValue: mockCartService },
                { provide: ProductService, useValue: mockProductService },
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: OrderGateway, useValue: mockOrderGateway },
                { provide: OrderMapper, useValue: mockOrderMapper },
            ]
        }).compile();
        createOrderByCartUseCase = module.get<CreateOrderByCartUseCase>(CreateOrderByCartUseCase);
    });

    describe("execute", () => {
        it("Deberia crear una orden desde el carrito", async () => {
            const result = await createOrderByCartUseCase.execute("123");
            expect(result).toBeDefined();
            expect(mockCartService.getActiveCartByUser).toHaveBeenCalled();
        });

        it("Deberia throw NotFoundException si no hay carrito activo", async () => {
            mockCartService.getActiveCartByUser.mockResolvedValue(null);
            await expect(createOrderByCartUseCase.execute("123")).rejects.toThrow(NotFoundException);
        });

        it("Deberia throw NotFoundException si el carrito esta vacio", async () => {
            mockCartService.getActiveCartByUser.mockResolvedValue({ id: 1, details: [] });
            await expect(createOrderByCartUseCase.execute("123")).rejects.toThrow(NotFoundException);
        });
    });
});