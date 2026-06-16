import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe("AuthGuard", () => {
    let authGuard: AuthGuard;
    let mockJwtService: any;

    beforeEach(async () => {
        mockJwtService = {
            verifyAsync: vi.fn().mockResolvedValue({ user: { uuid: "123" } })
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthGuard,
                { provide: JwtService, useValue: mockJwtService }
            ]
        }).compile();
        authGuard = module.get<AuthGuard>(AuthGuard);
    });

    describe("canActivate", () => {
        it("Deberia retornar true con token valido", async () => {
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        cookies: { access_token: "validToken" }
                    })
                })
            } as unknown as ExecutionContext;
            
            const result = await authGuard.canActivate(mockContext);
            expect(result).toBe(true);
        });

        it("Deberia throw UnauthorizedException sin token", async () => {
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({})
                })
            } as unknown as ExecutionContext;
            
            await expect(authGuard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
        });

        it("Deberia throw UnauthorizedException con token invalido", async () => {
            mockJwtService.verifyAsync = vi.fn().mockRejectedValue(new Error("Invalid token"));
            
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        cookies: { access_token: "invalidToken" }
                    })
                })
            } as unknown as ExecutionContext;
            
            await expect(authGuard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
        });
    });
});