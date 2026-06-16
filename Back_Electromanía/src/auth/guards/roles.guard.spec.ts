import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../user/enums/UserRole.enum';

describe("RolesGuard", () => {
    let rolesGuard: RolesGuard;
    let mockReflector: any;

    beforeEach(async () => {
        mockReflector = {
            getAllAndOverride: vi.fn().mockReturnValue(null)
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolesGuard,
                { provide: Reflector, useValue: mockReflector },
                { provide: JwtService, useValue: {} }
            ]
        }).compile();
        rolesGuard = module.get<RolesGuard>(RolesGuard);
    });

    describe("canActivate", () => {
        it("Deberia retornar true sin roles requeridos", async () => {
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({})
                }),
                getHandler: () => ({}),
                getClass: () => ({})
            } as unknown as ExecutionContext;
            
            const result = rolesGuard.canActivate(mockContext);
            expect(result).toBe(true);
        });

        it("Deberia throw ForbiddenException si el usuario no tiene roles", async () => {
            mockReflector.getAllAndOverride = vi.fn().mockReturnValue([UserRole.ADMIN]);
            
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({ user: { role: "USER" } })
                }),
                getHandler: () => ({}),
                getClass: () => ({})
            } as unknown as ExecutionContext;
            
            expect(() => rolesGuard.canActivate(mockContext)).toThrow(ForbiddenException);
        });

        it("Deberia retornar true si el usuario tiene el rol requerido", async () => {
            mockReflector.getAllAndOverride = vi.fn().mockReturnValue([UserRole.ADMIN]);
            
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({ user: { role: "ADMIN" } })
                }),
                getHandler: () => ({}),
                getClass: () => ({})
            } as unknown as ExecutionContext;
            
            const result = rolesGuard.canActivate(mockContext);
            expect(result).toBe(true);
        });

        it("Deberia throw UnauthorizedException si el usuario no existe", async () => {
            mockReflector.getAllAndOverride = vi.fn().mockReturnValue([UserRole.ADMIN]);
            
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({})
                }),
                getHandler: () => ({}),
                getClass: () => ({})
            } as unknown as ExecutionContext;
            
            expect(() => rolesGuard.canActivate(mockContext)).toThrow(UnauthorizedException);
        });
    });

    describe("hasRole", () => {
        it("Deberia retornar true si el usuario tiene el rol requerido", () => {
            const result = rolesGuard.hasRole([UserRole.ADMIN], { role: UserRole.ADMIN } as any);
            expect(result).toBe(true);
        });

        it("Deberia retornar false si el usuario no tiene el rol requerido", () => {
            const result = rolesGuard.hasRole([UserRole.ADMIN], { role: UserRole.USER } as any);
            expect(result).toBe(false);
        });
    });
});