import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../service/auth.service';
import { UserMapper } from '../../user/mapper/User.mapper';
import { UserService } from '../../user/service/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/service/prisma.service';
import { PasswordService } from '../../common/utils/password.service';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { LoginUseCase } from '../use-cases/login.usecase';
import { vi } from 'vitest';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: any;
  let mockLoginUseCase: any;

  beforeEach(async () => {
    mockAuthService = {
      registerUser: vi.fn().mockResolvedValue({ uuid: "123", name: "Test" }),
      registerAdminUser: vi.fn().mockResolvedValue({ uuid: "123", name: "Admin" }),
      registerEmployeeUser: vi.fn().mockResolvedValue({ uuid: "123", name: "Employee" }),
    };
    mockLoginUseCase = {
      execute: vi.fn().mockResolvedValue({ access_token: "token", user: { uuid: "123" } }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        UserMapper,
        UserService,
        JwtService,
        PrismaService,
        PasswordService,
        ConfigService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: vi.fn(),
            set: vi.fn(),
            del: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a user', async () => {
    const result = await controller.registerUser({ name: "Test", email: "test@test.com", password: "password" } as any);
    expect(result).toBeDefined();
  });

  it('should login a user', async () => {
    const mockResponse = {
      cookie: vi.fn(),
    } as any;
    const result = await controller.login({ email: "test@test.com", password: "password" } as any, mockResponse);
    expect(result).toBeDefined();
  });

  it('should register an admin user', async () => {
    const result = await controller.registerAdminUser({ name: "Admin", email: "admin@test.com", password: "password" } as any);
    expect(result).toBeDefined();
  });

  it('should register an employee user', async () => {
    const result = await controller.registerEmployeeUser({ name: "Employee", email: "employee@test.com", password: "password" } as any);
    expect(result).toBeDefined();
  });
});