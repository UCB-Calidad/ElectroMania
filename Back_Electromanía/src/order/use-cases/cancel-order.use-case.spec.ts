import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { CancelOrderUseCase } from './cancel-order.use-case';
import { OrderService } from '../service/order.service';
import { CartService } from '../../cart/service/cart.service';
import { ProductService } from '../../product/service/product.service';
import { PrismaService } from '../../prisma/service/prisma.service';
import { OrderGateway } from '../gateway/order.gateway';
import { OrderMapper } from '../mapper/order.mapper';
import { NotFoundException } from '@nestjs/common';

describe("CancelOrderUseCase", () => {
    let cancelOrderUseCase: CancelOrderUseCase;
    let mockOrderService: any;
    let mockCartService: any;
    let mockProductService: any;
    let mockPrismaService: any;
    let mockOrderGateway: any;
    let mockOrderMapper: any;

    beforeEach(async () => {
        mockOrderService = {
            getById: vi.fn().mockResolvedValue({ 
                order_id: 1, 
                status: "PENDING",
                cart: { id: 1, details: [] }
            }),
            update: vi.fn().mockResolvedValue({}),
        };
        mockCartService = {
            updateCart: vi.fn().mockResolvedValue({}),
        };
        mockProductService = {
            releaseReservedStock: vi.fn().mockResolvedValue({}),
            recoverReservedQuantity: vi.fn().mockResolvedValue({}),
        };
        mockPrismaService = {
            $transaction: vi.fn((callback) => callback({})),
        };
        mockOrderGateway = {
            emitOrderCancelled: vi.fn(),
        };
        mockOrderMapper = {
            toOrderCancelledEventDto: vi.fn().mockReturnValue({}),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CancelOrderUseCase,
                { provide: OrderService, useValue: mockOrderService },
                { provide: CartService, useValue: mockCartService },
                { provide: ProductService, useValue: mockProductService },
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: OrderGateway, useValue: mockOrderGateway },
                { provide: OrderMapper, useValue: mockOrderMapper },
            ]
        }).compile();
        cancelOrderUseCase = module.get<CancelOrderUseCase>(CancelOrderUseCase);
    });

    describe("execute", () => {
        it("Deberia cancelar una orden", async () => {
            const result = await cancelOrderUseCase.execute(1);
            expect(result).toBeDefined();
            expect(mockOrderService.getById).toHaveBeenCalledWith(1);
        });

        it("Deberia throw NotFoundException si la orden no existe", async () => {
            mockOrderService.getById.mockResolvedValue(null);
            await expect(cancelOrderUseCase.execute(999)).rejects.toThrow(NotFoundException);
        });
    });
});