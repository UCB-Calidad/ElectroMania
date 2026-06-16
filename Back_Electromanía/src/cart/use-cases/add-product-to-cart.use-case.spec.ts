import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { AddProductToCartUseCase } from './add-product-to-cart.use-case';
import { PrismaService } from '../../prisma/service/prisma.service';
import { ProductService } from '../../product/service/product.service';
import { CartService } from '../service/cart.service';
import { GetActiveCartUseCase } from './get-active-cart.use-case';
import { CreateCartUseCase } from './create-cart.use-case';
import { IncreaseQuantityUseCase } from './increase-quantity.use-case';

describe("AddProductToCartUseCase", () => {
    let addProductToCartUseCase: AddProductToCartUseCase;
    let mockPrismaService: any;
    let mockProductService: any;
    let mockCartService: any;
    let mockGetActiveCartUseCase: any;
    let mockCreateCartUseCase: any;
    let mockIncreaseQuantityUseCase: any;

    beforeEach(async () => {
        mockPrismaService = {
            $transaction: vi.fn((callback) => callback({})),
        };
        mockProductService = {
            getProductById: vi.fn().mockResolvedValue({ product_id: 1, name: "Test", price: 100 }),
        };
        mockCartService = {
            createCart: vi.fn().mockResolvedValue({ cart_id: 1 }),
        };
        mockGetActiveCartUseCase = {
            execute: vi.fn().mockResolvedValue({ cart_id: 1, details: [] }),
        };
        mockCreateCartUseCase = {
            execute: vi.fn().mockResolvedValue({ cart_id: 1 }),
        };
        mockIncreaseQuantityUseCase = {
            execute: vi.fn().mockResolvedValue(undefined),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AddProductToCartUseCase,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: ProductService, useValue: mockProductService },
                { provide: CartService, useValue: mockCartService },
                { provide: GetActiveCartUseCase, useValue: mockGetActiveCartUseCase },
                { provide: CreateCartUseCase, useValue: mockCreateCartUseCase },
                { provide: IncreaseQuantityUseCase, useValue: mockIncreaseQuantityUseCase },
            ]
        }).compile();
        addProductToCartUseCase = module.get<AddProductToCartUseCase>(AddProductToCartUseCase);
    });

    describe("execute", () => {
        it("Deberia agregar un producto al carrito", async () => {
            const result = await addProductToCartUseCase.execute("123", { productId: 1, quantity: 2 } as any);
            expect(result).toBeDefined();
            expect(mockPrismaService.$transaction).toHaveBeenCalled();
        });
    });
});