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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService,UserMapper,UserService,JwtService,PrismaService,PasswordService,
        ConfigService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: vi.fn(),
            set: vi.fn(),
            del: vi.fn(),
          },
        },LoginUseCase
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
