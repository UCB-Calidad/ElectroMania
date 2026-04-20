import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { RemoveProductFromCartUseCase } from './remove-product-from-cart-use-case';
import { CartService } from '../service/cart.service';
import { ProductService } from '../../product/service/product.service';
import { GetActiveCartUseCase } from './get-active-cart.use-case';
import { ForbiddenException } from '@nestjs/common';

describe("RemoveProductFromCartUseCase", () => {
    let removeProductFromCartUseCase: RemoveProductFromCartUseCase;
    let mockCartService: any;
    let mockProductService: any;
    let mockGetActiveCartUseCase: any;

    beforeEach(async () => {
        mockCartService = {
            getCartDetailByCartAndProduct: vi.fn().mockResolvedValue({ id: 1, quantity: 2 }),
            deleteCartDetailById: vi.fn().mockResolvedValue({}),
        };
        mockProductService = {
            releaseReservedStock: vi.fn().mockResolvedValue({}),
        };
        mockGetActiveCartUseCase = {
            execute: vi.fn().mockResolvedValue({ id: 1 }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RemoveProductFromCartUseCase,
                { provide: CartService, useValue: mockCartService },
                { provide: ProductService, useValue: mockProductService },
                { provide: GetActiveCartUseCase, useValue: mockGetActiveCartUseCase },
            ]
        }).compile();
        removeProductFromCartUseCase = module.get<RemoveProductFromCartUseCase>(RemoveProductFromCartUseCase);
    });

    describe("execute", () => {
        it("Deberia remover un producto del carrito", async () => {
            const result = await removeProductFromCartUseCase.execute("123", { productId: 1 } as any);
            expect(result).toBeDefined();
            expect(mockCartService.deleteCartDetailById).toHaveBeenCalled();
        });

        it("Deberia throw ForbiddenException si el carrito no existe", async () => {
            mockGetActiveCartUseCase.execute.mockResolvedValue(null);
            await expect(
                removeProductFromCartUseCase.execute("123", { productId: 1 } as any)
            ).rejects.toThrow(ForbiddenException);
        });

        it("Deberia throw ForbiddenException si el producto no esta en el carrito", async () => {
            mockCartService.getCartDetailByCartAndProduct.mockResolvedValue(null);
            await expect(
                removeProductFromCartUseCase.execute("123", { productId: 999 } as any)
            ).rejects.toThrow(ForbiddenException);
        });
    });
});