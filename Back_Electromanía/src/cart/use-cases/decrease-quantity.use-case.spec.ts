import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { DecreaseQuantityUseCase } from './decrease-quantity.use-case';
import { PrismaService } from '../../prisma/service/prisma.service';
import { AuthService } from '../../auth/service/auth.service';
import { ProductService } from '../../product/service/product.service';
import { CartService } from '../service/cart.service';
import { RemoveProductFromCartUseCase } from './remove-product-from-cart-use-case';
import { ForbiddenException } from '@nestjs/common';

describe("DecreaseQuantityUseCase", () => {
    let decreaseQuantityUseCase: DecreaseQuantityUseCase;
    let mockProductService: any;
    let mockCartService: any;
    let mockPrismaService: any;
    let mockAuthService: any;
    let mockRemoveProductFromCartUseCase: any;

    beforeEach(async () => {
        mockProductService = {
            releaseReservedStock: vi.fn().mockResolvedValue(undefined),
        };
        mockCartService = {
            getActiveCartByUser: vi.fn().mockResolvedValue({ id: 1 }),
            getCartDetailByCartAndProduct: vi.fn().mockResolvedValue({ id: 1, quantity: 5 }),
            decreaseQuantity: vi.fn().mockResolvedValue({}),
        };
        mockPrismaService = {};
        mockAuthService = {};
        mockRemoveProductFromCartUseCase = {
            execute: vi.fn().mockResolvedValue(true),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DecreaseQuantityUseCase,
                { provide: ProductService, useValue: mockProductService },
                { provide: CartService, useValue: mockCartService },
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: AuthService, useValue: mockAuthService },
                { provide: RemoveProductFromCartUseCase, useValue: mockRemoveProductFromCartUseCase },
            ]
        }).compile();
        decreaseQuantityUseCase = module.get<DecreaseQuantityUseCase>(DecreaseQuantityUseCase);
    });

    describe("execute", () => {
        it("Deberia decrementar la cantidad de un producto en el carrito", async () => {
            const result = await decreaseQuantityUseCase.execute("123", { productId: 1, quantity: 2 } as any);
            expect(result).toBe(true);
            expect(mockCartService.decreaseQuantity).toHaveBeenCalled();
        });

        it("Deberia throw ForbiddenException si el carrito no existe", async () => {
            mockCartService.getActiveCartByUser.mockResolvedValue(null);
            await expect(
                decreaseQuantityUseCase.execute("123", { productId: 1, quantity: 2 } as any)
            ).rejects.toThrow(ForbiddenException);
        });

        it("Deberia throw ForbiddenException si el producto no esta en el carrito", async () => {
            mockCartService.getCartDetailByCartAndProduct.mockResolvedValue(null);
            await expect(
                decreaseQuantityUseCase.execute("123", { productId: 999, quantity: 2 } as any)
            ).rejects.toThrow(ForbiddenException);
        });

        it("Deberia remover el producto si la cantidad es menor a la solicitada", async () => {
            mockCartService.getCartDetailByCartAndProduct.mockResolvedValue({ id: 1, quantity: 1 });
            const result = await decreaseQuantityUseCase.execute("123", { productId: 1, quantity: 5 } as any);
            expect(result).toBe(true);
            expect(mockRemoveProductFromCartUseCase.execute).toHaveBeenCalled();
        });
    });
});