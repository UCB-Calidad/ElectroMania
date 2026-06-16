import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase } from './login.usecase';
import { AuthService } from '../service/auth.service';
import { UserService } from '../../user/service/user.service';
import { PasswordService } from '../../common/utils/password.service';
import { UserMapper } from '../../user/mapper/User.mapper';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../user/enums/UserRole.enum';

describe("LoginUseCase", () => {
    let loginUseCase: LoginUseCase;
    let mockAuthService: any;
    let mockUserService: any;
    let mockPasswordService: any;
    let mockUserMapper: any;

    beforeEach(async () => {
        mockAuthService = {
            generateToken: vi.fn().mockResolvedValue({ access_token: "jwt-token" })
        };
        mockUserService = {
            getUserByField: vi.fn()
        };
        mockPasswordService = {
            comparePassword: vi.fn().mockResolvedValue(true)
        };
        mockUserMapper = {
            toJwtPayloadModel: vi.fn().mockReturnValue({ uuid: "123", email: "test@test.com", role: UserRole.USER }),
            toModel: vi.fn().mockReturnValue({ uuid: "123", name: "Test" })
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LoginUseCase,
                { provide: AuthService, useValue: mockAuthService },
                { provide: UserService, useValue: mockUserService },
                { provide: PasswordService, useValue: mockPasswordService },
                { provide: UserMapper, useValue: mockUserMapper }
            ]
        }).compile();
        loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    });

    describe("execute", () => {
        it("Deberia hacer login exitosamente", async () => {
            const mockUser = { uuid: "123", email: "test@test.com", password: "hashed", name: "Test" };
            mockUserService.getUserByField.mockResolvedValue(mockUser);
            mockPasswordService.comparePassword.mockResolvedValue(true);

            const result = await loginUseCase.execute({ email: "test@test.com", password: "password123" });
            
            expect(result).toBeDefined();
            expect(result.access_token).toBe("jwt-token");
            expect(mockUserService.getUserByField).toHaveBeenCalledWith("email", "test@test.com");
        });

        it("Deberia throw UnauthorizedException si el usuario no existe", async () => {
            mockUserService.getUserByField.mockResolvedValue(null);

            await expect(
                loginUseCase.execute({ email: "notfound@test.com", password: "password123" })
            ).rejects.toThrow(UnauthorizedException);
        });

        it("Deberia throw UnauthorizedException si la contrasena es incorrecta", async () => {
            const mockUser = { uuid: "123", email: "test@test.com", password: "hashed" };
            mockUserService.getUserByField.mockResolvedValue(mockUser);
            mockPasswordService.comparePassword.mockResolvedValue(false);

            await expect(
                loginUseCase.execute({ email: "test@test.com", password: "wrongpassword" })
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});