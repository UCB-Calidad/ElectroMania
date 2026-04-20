import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { IncreaseQuantityUseCase } from './increase-quantity.use-case';
import { ProductService } from '../../product/service/product.service';
import { CartService } from '../service/cart.service';
import { PrismaService } from '../../prisma/service/prisma.service';
import { AuthService } from '../../auth/service/auth.service';
import { ForbiddenException } from '@nestjs/common';

describe("IncreaseQuantityUseCase", () => {
    let increaseQuantityUseCase: IncreaseQuantityUseCase;
    let mockProductService: any;
    let mockCartService: any;
    let mockPrismaService: any;
    let mockAuthService: any;

    beforeEach(async () => {
        mockProductService = {
            getProductById: vi.fn().mockResolvedValue({ product_id: 1, name: "Test", price: 100 }),
            reserveStock: vi.fn().mockResolvedValue(undefined),
        };
        mockCartService = {
            getActiveCartByUser: vi.fn().mockResolvedValue({ id: 1 }),
            createCart: vi.fn().mockResolvedValue({ id: 1 }),
            getCartDetailByCartAndProduct: vi.fn().mockResolvedValue(null),
            increaseQuantity: vi.fn().mockResolvedValue({}),
            createCartDetail: vi.fn().mockResolvedValue({}),
        };
        mockPrismaService = {};
        mockAuthService = {};

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IncreaseQuantityUseCase,
                { provide: ProductService, useValue: mockProductService },
                { provide: CartService, useValue: mockCartService },
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: AuthService, useValue: mockAuthService },
            ]
        }).compile();
        increaseQuantityUseCase = module.get<IncreaseQuantityUseCase>(IncreaseQuantityUseCase);
    });

    describe("execute", () => {
        it("Deberia incrementar la cantidad de un producto en el carrito", async () => {
            const result = await increaseQuantityUseCase.execute("123", { productId: 1, quantity: 2 } as any);
            expect(result).toBe(true);
            expect(mockCartService.getActiveCartByUser).toHaveBeenCalled();
        });

        it("Deberia throw ForbiddenException si el producto no existe", async () => {
            mockProductService.getProductById.mockResolvedValue(null);
            await expect(
                increaseQuantityUseCase.execute("123", { productId: 999, quantity: 2 } as any)
            ).rejects.toThrow(ForbiddenException);
        });

        it("Deberia crear nuevo detalle si no existe", async () => {
            mockCartService.getCartDetailByCartAndProduct.mockResolvedValue(null);
            const result = await increaseQuantityUseCase.execute("123", { productId: 1, quantity: 2 } as any);
            expect(result).toBe(true);
            expect(mockCartService.createCartDetail).toHaveBeenCalled();
        });
    });
});