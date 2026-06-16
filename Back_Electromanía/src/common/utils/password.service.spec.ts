import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import { ConfigService } from '@nestjs/config';

describe("PasswordService", () => {
    let passwordService: PasswordService;
    let mockConfigService: any;

    beforeEach(async () => {
        mockConfigService = {
            get: vi.fn().mockReturnValue(10)
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PasswordService,
                { provide: ConfigService, useValue: mockConfigService }
            ]
        }).compile();
        passwordService = module.get<PasswordService>(PasswordService);
    });

    describe("hashPassword", () => {
        it("Deberia generar un hash de contrasena", async () => {
            const result = await passwordService.hashPassword("password123");
            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
        });
    });

    describe("comparePassword", () => {
        it("Deberia retornar true para contrasena correcta", async () => {
            const hash = await passwordService.hashPassword("password123");
            const result = await passwordService.comparePassword("password123", hash);
            expect(result).toBe(true);
        });

        it("Deberia retornar false para contrasena incorrecta", async () => {
            const result = await passwordService.comparePassword("wrongpassword", "hash");
            expect(result).toBe(false);
        });
    });

    describe("generateStrongPassword", () => {
        it("Deberia generar una contrasena fuerte", () => {
            const result = PasswordService.generateStrongPassword();
            expect(result).toBeDefined();
            expect(result.length).toBe(12);
        });
    });
});