import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../../user/service/user.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from '../../common/utils/password.service';
import { UserMapper } from '../../user/mapper/User.mapper';
import { PrismaService } from '../../prisma/service/prisma.service';
import { UserCreateRequestModel } from '../../user/models/UserCreateRequest.model';
import { UserLoginRequestModel } from '../models/user-login.model';
import { LoginResponseModel } from '../models/login-response.model';
import { UserJwtPayloadModel } from '../models/user-jwt-payload.model';
import { UserRole } from '../../user/enums/UserRole.enum';
import { UnauthorizedException } from '@nestjs/common';
import { vi } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let passwordService: PasswordService;
  let userMapper: UserMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserMapper,
          useValue: {
            toJwtPayloadModel: vi.fn(
              (user) =>
                new UserJwtPayloadModel(user.uuid, user.email, user.role),
            ),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: vi.fn(),
              create: vi.fn(),
              deleteMany: vi.fn(),
            },
          },
        },
        {
          provide: UserService,
          useValue: {
            registerUser: vi.fn(),
            registerAdminUser: vi.fn(),
            registerEmployedUser: vi.fn(),
            getUserByField: vi.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hashPassword: vi.fn((password: string) => `hashed-${password}`),
            comparePassword: vi.fn(
              (password: string, hash: string) => password === hash,
            ),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: vi.fn(() => 'jwt-token'),
            verify: vi.fn((token: string) => ({
              user: {
                uuid: '123',
                email: 'test@gmail.com',
                role: UserRole.USER,
              },
            })),
            decode: vi.fn((token: string) => ({
              user: {
                uuid: '123',
                email: 'test@gmail.com',
                role: UserRole.USER,
              },
            })),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    passwordService = module.get<PasswordService>(PasswordService);
    userMapper = module.get<UserMapper>(UserMapper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Deberia registrar un usuario', async () => {
    const request: UserCreateRequestModel = {
      name: 'pruebas',
      email: 'pruebas@gmail.com',
      password: 'Password#3101#',
      nit_ci: '1234567121',
      social_reason: 'pruebas',
      phone: '1234567121',
    };

    (userService.registerUser as vi.Mock).mockResolvedValue({
      id: 1,
      ...request,
      password: `hashed-${request.password}`,
    });

    const result = await service.registerUser(request);
    expect(result).toBeTruthy();
    expect(userService.registerUser).toHaveBeenCalledWith(request);
  });

  it('Deberia iniciar sesion correctamente', async () => {
    const request: UserLoginRequestModel = {
      email: 'pruebas@gmail.com',
      password: 'Password#3101#',
    };

    const mockUser = {
      uuid: '123',
      email: request.email,
      password: 'Password#3101#',
      role: UserRole.USER,
    };

    (userService.getUserByField as vi.Mock).mockResolvedValue(mockUser);

    const result: LoginResponseModel = await service.login(request);

    expect(result).toBeTruthy();
    expect(result.access_token).toBe('jwt-token');
    expect(userService.getUserByField).toHaveBeenCalledWith(
      'email',
      request.email,
    );
  });

  it('Deberia lanzar UnauthorizedException si el usuario no existe', async () => {
    (userService.getUserByField as vi.Mock).mockResolvedValue(null);

    await expect(
      service.login({
        email: 'noexiste@gmail.com',
        password: 'Password#3101#',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('Deberia lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
    const mockUser = {
      uuid: '123',
      email: 'pruebas@gmail.com',
      password: 'wrong-password',
      role: UserRole.USER,
    };

    (userService.getUserByField as vi.Mock).mockResolvedValue(mockUser);

    await expect(
      service.login({ email: 'pruebas@gmail.com', password: 'Password#3101#' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('Deberia generar y validar un token', async () => {
    const payload = new UserJwtPayloadModel(
      '123',
      'test@gmail.com',
      UserRole.USER,
    );

    const token: LoginResponseModel = await service['generateToken'](payload);

    expect(token.access_token).toBe('jwt-token');

    const decoded = await service.validateToken(token.access_token);
    expect(decoded).toEqual({
      user: { uuid: '123', email: 'test@gmail.com', role: UserRole.USER },
    });
  });

  it('Deberia registrar un usuario admin', async () => {
    const request: UserCreateRequestModel = {
      name: 'admin',
      email: 'admin@gmail.com',
      password: 'Password#123#',
      nit_ci: '1234567890',
      social_reason: 'Admin',
      phone: '1234567890',
    };

    (userService.registerAdminUser as vi.Mock).mockResolvedValue({ uuid: "123" });
    const result = await service.registerAdminUser(request);
    expect(result).toBeDefined();
  });

  it('Deberia throw UnauthorizedException cuando el email ya esta en uso (admin)', async () => {
    const request: UserCreateRequestModel = {
      name: 'admin',
      email: 'admin@gmail.com',
      password: 'Password#123#',
      nit_ci: '1234567890',
      social_reason: 'Admin',
      phone: '1234567890',
    };

    (userService.registerAdminUser as vi.Mock).mockRejectedValue({ code: 'P2002' });
    await expect(service.registerAdminUser(request)).rejects.toThrow(UnauthorizedException);
  });

  it('Deberia throw UnauthorizedException cuando el role es invalido (admin)', async () => {
    const request: UserCreateRequestModel = {
      name: 'admin',
      email: 'admin@gmail.com',
      password: 'Password#123#',
      nit_ci: '1234567890',
      social_reason: 'Admin',
      phone: '1234567890',
    };

    (userService.registerAdminUser as vi.Mock).mockRejectedValue({ code: 'P2003' });
    await expect(service.registerAdminUser(request)).rejects.toThrow(UnauthorizedException);
  });

  it('Deberia registrar un usuario empleado', async () => {
    const request: UserCreateRequestModel = {
      name: 'employee',
      email: 'employee@gmail.com',
      password: 'Password#123#',
      nit_ci: '1234567890',
      social_reason: 'Employee',
      phone: '1234567890',
    };

    (userService.registerEmployedUser as vi.Mock).mockResolvedValue({ uuid: "123" });
    const result = await service.registerEmployeeUser(request);
    expect(result).toBeDefined();
  });

  it('Deberia throw UnauthorizedException cuando el email ya esta en uso (empleado)', async () => {
    const request: UserCreateRequestModel = {
      name: 'employee',
      email: 'employee@gmail.com',
      password: 'Password#123#',
      nit_ci: '1234567890',
      social_reason: 'Employee',
      phone: '1234567890',
    };

    (userService.registerEmployedUser as vi.Mock).mockRejectedValue({ code: 'P2002' });
    await expect(service.registerEmployeeUser(request)).rejects.toThrow(UnauthorizedException);
  });

  it('Deberia throw UnauthorizedException para error desconocido en registerUser', async () => {
    const request: UserCreateRequestModel = {
      name: 'user',
      email: 'user@gmail.com',
      password: 'Password#123#',
      nit_ci: '1234567890',
      social_reason: 'User',
      phone: '1234567890',
    };

    (userService.registerUser as vi.Mock).mockRejectedValue({ code: 'P9999' });
    await expect(service.registerUser(request)).rejects.toThrow(UnauthorizedException);
  });

  it('Deberia throw UnauthorizedException cuando el token es invalido en getUserFromToken', async () => {
    const mockJwtService = {
      verify: vi.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      }),
    };
    (jwtService.verify as vi.fn).mockImplementation(() => {
      throw new Error('Invalid token');
    });
    await expect(service.getUserFromToken('invalid-token')).rejects.toThrow(UnauthorizedException);
  });

  it('Deberia throw UnauthorizedException cuando el token esta expirado', async () => {
    (jwtService.verify as vi.fn).mockImplementation(() => {
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      throw error;
    });
    await expect(service.getUserFromToken('expired-token')).rejects.toThrow(UnauthorizedException);
  });

  it('Deberia throw UnauthorizedException cuando el token es JsonWebTokenError', async () => {
    (jwtService.verify as vi.fn).mockImplementation(() => {
      const error = new Error('Invalid signature');
      error.name = 'JsonWebTokenError';
      throw error;
    });
    await expect(service.getUserFromToken('invalid-token')).rejects.toThrow(UnauthorizedException);
  });

  it('Deberia throw UnauthorizedException para error generico de token', async () => {
    (jwtService.verify as vi.fn).mockImplementation(() => {
      throw new Error('Unknown error');
    });
    await expect(service.getUserFromToken('unknown-error-token')).rejects.toThrow(UnauthorizedException);
  });

  it('Deberia validar un usuario por id', async () => {
    const mockUser = { uuid: '123', name: 'Test' };
    (userService.getUserByField as vi.Mock).mockResolvedValue(mockUser);
    const result = await service.validateUserById('123');
    expect(result).toBeDefined();
  });

  it('Deberia obtener usuario desde token', async () => {
    const mockUser = { uuid: '123', email: 'test@test.com' };
    (userService.getUserByField as vi.Mock).mockResolvedValue(mockUser);
    const result = await service.getUserFromToken('valid-token');
    expect(result).toBeDefined();
  });

  
});