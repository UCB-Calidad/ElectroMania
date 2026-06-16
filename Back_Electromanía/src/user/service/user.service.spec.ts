import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserMapper } from '../mapper/User.mapper';
import { PrismaService } from '../../prisma/service/prisma.service';
import { PasswordService } from '../../common/utils/password.service';
import { AuthService } from '../../auth/service/auth.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe("UserService", () => {
    let userService: UserService;
    let mockPrismaService: any;
    let mockCacheManager: any;
    let mockPasswordService: any;
    let mockUserMapper: any;

    beforeEach(async () => {
        mockPrismaService = {
            user: {
                findMany: vi.fn().mockResolvedValue([]),
                create: vi.fn().mockResolvedValue({ uuid: "123", name: "Test", email: "test@test.com" }),
                findFirst: vi.fn().mockResolvedValue(null)
            }
        };
        mockCacheManager = {
            get: vi.fn().mockResolvedValue(null),
            set: vi.fn(),
            del: vi.fn()
        };
        mockPasswordService = {
            hashPassword: vi.fn().mockResolvedValue("hashed")
        };
        mockUserMapper = {
            toModel: vi.fn().mockReturnValue({ uuid: "123", name: "Test" }),
            toEntity: vi.fn().mockReturnValue({}),
            toRegisterUserModel: vi.fn().mockReturnValue({ uuid: "123" }),
            toRegisterAdminUserEntity: vi.fn().mockReturnValue({}),
            toRegisterEmployedUserEntity: vi.fn().mockReturnValue({})
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: UserMapper, useValue: mockUserMapper },
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: PasswordService, useValue: mockPasswordService },
                { provide: AuthService, useValue: { } },
                { provide: CACHE_MANAGER, useValue: mockCacheManager }
            ]
        }).compile();
        userService = module.get<UserService>(UserService);
    });

    describe("findAll", () => {
        it("Deberia retornar usuarios desde cache si existen", async () => {
            const cachedUsers = [{ uuid: "1", name: "User1" }];
            mockCacheManager.get.mockResolvedValue(cachedUsers);
            const result = await userService.findAll();
            expect(result).toBe(cachedUsers);
        });

        it("Deberia llamar a prisma si no hay cache", async () => {
            const users = [{ uuid: "1", name: "User1" }];
            mockPrismaService.user.findMany.mockResolvedValue(users);
            const result = await userService.findAll();
            expect(result).toEqual(users);
            expect(mockPrismaService.user.findMany).toHaveBeenCalled();
        });
    });

    describe("getAllUsers", () => {
        it("Deberia retornar modelos de usuarios", async () => {
            const users = [{ uuid: "1", name: "User1" }];
            mockPrismaService.user.findMany.mockResolvedValue(users);
            const result = await userService.getAllUsers();
            expect(result).toBeDefined();
        });
    });

    describe("createUser", () => {
        it("Deberia crear un usuario", async () => {
            const userData: Prisma.UserCreateInput = { name: "Test", email: "test@test.com" } as any;
            const result = await userService.createUser(userData);
            expect(result).toBeDefined();
            expect(mockPrismaService.user.create).toHaveBeenCalled();
        });
    });

    describe("registerUser", () => {
        it("Deberia registrar un usuario", async () => {
            const mockUser = { email: "test@test.com", password: "password123" } as any;
            mockPrismaService.user.create.mockResolvedValue({ uuid: "123", role: "USER" });
            const result = await userService.registerUser(mockUser);
            expect(result).toBeDefined();
        });

        it("Deberia throw ConflictException si el usuario ya existe", async () => {
            const mockUser = { email: "test@test.com", password: "password123" } as any;
            mockPrismaService.user.create.mockRejectedValue({ code: 'P2002' });
            await expect(userService.registerUser(mockUser)).rejects.toThrow(ConflictException);
        });

        it("Deberia lanzar ConflictException si el usuario ya existe", async () => {
            const error = { code: 'P2002' };
            mockPasswordService.hashPassword.mockRejectedValue(error);
            await expect(userService.registerUser({ email: "test@test.com" } as any)).rejects.toThrow(ConflictException);
        });
    });

    describe("getUserByUUID", () => {
        it("Deberia throw NotFoundException si no existe el usuario", async () => {
            mockPrismaService.user.findFirst.mockResolvedValue(null);
            await expect(userService.getUserByUUID("123")).rejects.toThrow(NotFoundException);
        });

        it("Deberia retornar el modelo si existe el usuario", async () => {
            const user = { uuid: "123", name: "Test" };
            mockPrismaService.user.findFirst.mockResolvedValue(user);
            const result = await userService.getUserByUUID("123");
            expect(result).toBeDefined();
        });
    });

    describe("getUserByField", () => {
        it("Deberia buscar usuario por campo", async () => {
            const user = { uuid: "123", email: "test@test.com" };
            mockPrismaService.user.findFirst.mockResolvedValue(user);
            const result = await userService.getUserByField("email", "test@test.com");
            expect(result).toBeDefined();
        });
    });

    describe("userExistByField", () => {
        it("Deberia retornar true si el usuario existe", async () => {
            mockPrismaService.user.findFirst.mockResolvedValue({ uuid: "123" });
            const result = await userService.userExistByField("email", "test@test.com");
            expect(result).toBe(true);
        });
    });

    describe("filterBy", () => {
        it("Deberia filtrar usuarios desde cache", async () => {
            const cachedUsers = [{ uuid: "1", name: "User1" }];
            mockCacheManager.get.mockResolvedValue(cachedUsers);
            const result = await userService.filterBy({ name: "User1" });
            expect(result).toBe(cachedUsers);
        });

        it("Deberia llamar a prisma para filtrar si no hay cache", async () => {
            const users = [{ uuid: "1", name: "User1" }];
            mockPrismaService.user.findMany.mockResolvedValue(users);
            const result = await userService.filterBy({ name: "User1" });
            expect(result).toEqual(users);
        });
    });

    describe("registerAdminUser", () => {
        it("Deberia registrar un usuario admin", async () => {
            const mockUser = { email: "admin@test.com", password: "password123" } as any;
            mockPrismaService.user.create.mockResolvedValue({ uuid: "123", role: "ADMIN" });
            const result = await userService.registerAdminUser(mockUser);
            expect(result).toBeDefined();
        });

        it("Deberia throw ConflictException si el usuario ya existe", async () => {
            const mockUser = { email: "admin@test.com", password: "password123" } as any;
            mockPrismaService.user.create.mockRejectedValue({ code: 'P2002' });
            await expect(userService.registerAdminUser(mockUser)).rejects.toThrow(ConflictException);
        });

        it("Deberia re-lanzar error si no es P2002", async () => {
            const mockUser = { email: "admin@test.com", password: "password123" } as any;
            mockPrismaService.user.create.mockRejectedValue({ code: 'P5000', message: 'Database error' });
            await expect(userService.registerAdminUser(mockUser)).rejects.toEqual({ code: 'P5000', message: 'Database error' });
        });
    });

    describe("registerEmployedUser", () => {
        it("Deberia registrar un usuario empleado", async () => {
            const mockUser = { email: "employee@test.com", password: "password123" } as any;
            mockPrismaService.user.create.mockResolvedValue({ uuid: "123", role: "EMPLOYED" });
            const result = await userService.registerEmployedUser(mockUser);
            expect(result).toBeDefined();
        });

        it("Deberia throw ConflictException si el usuario ya existe", async () => {
            const mockUser = { email: "employee@test.com", password: "password123" } as any;
            mockPrismaService.user.create.mockRejectedValue({ code: 'P2002' });
            await expect(userService.registerEmployedUser(mockUser)).rejects.toThrow(ConflictException);
        });

        it("Deberia re-lanzar error si no es P2002", async () => {
            const mockUser = { email: "employee@test.com", password: "password123" } as any;
            mockPrismaService.user.create.mockRejectedValue({ code: 'P5000', message: 'Database error' });
            await expect(userService.registerEmployedUser(mockUser)).rejects.toEqual({ code: 'P5000', message: 'Database error' });
        });
    });
});