import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { CartCleanUpService } from './cart-clean-up.service';
import { PrismaService } from '../../prisma/service/prisma.service';
import { ProductService } from '../../product/service/product.service';
import { CartState } from '../enums/CartState.enum';

describe("CartCleanUpService", () => {
    let cartCleanUpService: CartCleanUpService;
    let mockPrismaService: any;
    let mockProductService: any;

    beforeEach(async () => {
        mockPrismaService = {
            cart: {
                findMany: vi.fn().mockResolvedValue([]),
            },
            $transaction: vi.fn((callback) => callback({})),
        };
        mockProductService = {
            releaseReservedStock: vi.fn().mockResolvedValue({}),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CartCleanUpService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: ProductService, useValue: mockProductService },
            ]
        }).compile();
        cartCleanUpService = module.get<CartCleanUpService>(CartCleanUpService);
    });

    describe("cleanUpInactiveCarts", () => {
        it("Deberia limpiar carritos inactivos", async () => {
            mockPrismaService.cart.findMany.mockResolvedValueOnce([]);
            const result = await cartCleanUpService.cleanUpInactiveCarts();
            expect(result).toBeUndefined();
        });

        it("Deberia procesar carritos expirados", async () => {
            const expiredCarts = [{
                cart_id: 1,
                cartDetails: [{ product_id: 1, quantity: 2 }],
            }];
            mockPrismaService.cart.findMany.mockResolvedValueOnce(expiredCarts);
            const result = await cartCleanUpService.cleanUpInactiveCarts();
            expect(result).toBeUndefined();
        });
    });
});