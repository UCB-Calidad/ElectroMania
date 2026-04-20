import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { RegisterProductUseCase } from './register-product.use-case';
import { ProductService } from '../service/product.service';
import { PrismaService } from '../../prisma/service/prisma.service';

describe("RegisterProductUseCase", () => {
    let registerProductUseCase: RegisterProductUseCase;
    let mockProductService: any;
    let mockPrismaService: any;
    let mockImageStorage: any;

    beforeEach(async () => {
        mockProductService = {
            createProduct: vi.fn().mockResolvedValue({ product_id: 1, product_name: "Test" }),
            registerProductImage: vi.fn().mockResolvedValue({}),
            assignCategory: vi.fn().mockResolvedValue({}),
            getProductById: vi.fn().mockResolvedValue({ product_id: 1 }),
        };
        mockPrismaService = {
            $transaction: vi.fn((callback) => callback({})),
        };
        mockImageStorage = {
            upload: vi.fn().mockResolvedValue("http://image.url"),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RegisterProductUseCase,
                { provide: ProductService, useValue: mockProductService },
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: 'ImageStorage', useValue: mockImageStorage },
            ]
        }).compile();
        registerProductUseCase = module.get<RegisterProductUseCase>(RegisterProductUseCase);
    });

    describe("execute", () => {
        it("Deberia registrar un producto", async () => {
            const result = await registerProductUseCase.execute({ product_name: "Test", price: 100, stock: 10, description: "Test" } as any);
            expect(result).toBeDefined();
            expect(mockProductService.createProduct).toHaveBeenCalled();
        });

        it("Deberia registrar un producto con imagen", async () => {
            const mockFile = { originalname: "test.jpg" } as Express.Multer.File;
            const result = await registerProductUseCase.execute({ product_name: "Test", price: 100, stock: 10, description: "Test" } as any, mockFile);
            expect(result).toBeDefined();
            expect(mockProductService.registerProductImage).toHaveBeenCalled();
        });

        it("Deberia registrar un producto con categoria", async () => {
            const result = await registerProductUseCase.execute({ product_name: "Test", price: 100, stock: 10, description: "Test", category_id: 1 } as any);
            expect(result).toBeDefined();
            expect(mockProductService.assignCategory).toHaveBeenCalled();
        });
    });
});