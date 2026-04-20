import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProductQuantityUseCase } from './update-product-quantity.use-case';
import { PrismaService } from '../../prisma/service/prisma.service';
import { AuthService } from '../../auth/service/auth.service';
import { IncreaseQuantityUseCase } from './increase-quantity.use-case';
import { DecreaseQuantityUseCase } from './decrease-quantity.use-case';
import { GetActiveCartUseCase } from './get-active-cart.use-case';

describe("UpdateProductQuantityUseCase", () => {
    let updateProductQuantityUseCase: UpdateProductQuantityUseCase;
    let mockIncreaseQuantityUseCase: any;
    let mockDecreaseQuantityUseCase: any;
    let mockGetActiveCartUseCase: any;
    let mockPrismaService: any;
    let mockAuthService: any;

    beforeEach(async () => {
        mockIncreaseQuantityUseCase = {
            execute: vi.fn().mockResolvedValue(true),
        };
        mockDecreaseQuantityUseCase = {
            execute: vi.fn().mockResolvedValue(true),
        };
        mockGetActiveCartUseCase = {
            execute: vi.fn().mockResolvedValue({ id: 1 }),
        };
        mockPrismaService = {};
        mockAuthService = {};

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateProductQuantityUseCase,
                { provide: IncreaseQuantityUseCase, useValue: mockIncreaseQuantityUseCase },
                { provide: DecreaseQuantityUseCase, useValue: mockDecreaseQuantityUseCase },
                { provide: GetActiveCartUseCase, useValue: mockGetActiveCartUseCase },
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: AuthService, useValue: mockAuthService },
            ]
        }).compile();
        updateProductQuantityUseCase = module.get<UpdateProductQuantityUseCase>(UpdateProductQuantityUseCase);
    });

    describe("execute", () => {
        it("Deberia incrementar la cantidad si es positiva", async () => {
            const result = await updateProductQuantityUseCase.execute("123", { productId: 1, quantity: 2 } as any);
            expect(result).toBeDefined();
            expect(mockIncreaseQuantityUseCase.execute).toHaveBeenCalled();
        });

        it("Deberia decrementar la cantidad si es negativa", async () => {
            const result = await updateProductQuantityUseCase.execute("123", { productId: 1, quantity: -2 } as any);
            expect(result).toBeDefined();
            expect(mockDecreaseQuantityUseCase.execute).toHaveBeenCalled();
        });
    });
});