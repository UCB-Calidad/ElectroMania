import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { CreateCartUseCase } from './create-cart.use-case';
import { CartService } from '../service/cart.service';
import { JwtService } from '@nestjs/jwt';

describe("CreateCartUseCase", () => {
    let createCartUseCase: CreateCartUseCase;
    let mockCartService: any;
    let mockJwtService: any;

    beforeEach(async () => {
        mockCartService = {
            createCart: vi.fn().mockResolvedValue({ cart_id: 1 }),
        };
        mockJwtService = {};

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateCartUseCase,
                { provide: CartService, useValue: mockCartService },
                { provide: JwtService, useValue: mockJwtService },
            ]
        }).compile();
        createCartUseCase = module.get<CreateCartUseCase>(CreateCartUseCase);
    });

    describe("execute", () => {
        it("Deberia crear un carrito para el usuario", async () => {
            const result = await createCartUseCase.execute("123");
            expect(result).toBeDefined();
            expect(mockCartService.createCart).toHaveBeenCalledWith("123");
        });
    });
});