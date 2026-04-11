import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { UserCreateRequestModel } from '../../user/models/UserCreateRequest.model';
import { UserLoginRequestModel } from '../models/user-login.model';
import {
  ApiFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserModel } from '../../user/models/User.model';
import { UserJwtPayloadModel } from '../models/user-jwt-payload.model';
import { Response } from 'express';
import { LoginUseCase } from '../use-cases/login.usecase';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../../user/enums/UserRole.enum';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { PasswordService } from '../../common/utils/password.service';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @ApiOperation({
    summary: 'Registrar un nuevo usuario ',
    description: 'Registrar un nuevo usuario',
    tags: ['auth'],
    operationId: 'registerUser',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/UserCreateRequestModel',
          },
          example: {
            name: 'prueba',
            email: 'prueba@gmail',
            password: PasswordService.generateStrongPassword(),
            nit_ci: '123456789',
            social_reason: 'prueba',
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Usuario registrado',
    type: UserModel,
    example: {
      uuid: 'uuid',
      name: 'prueba',
      email: 'prueba@gmail',
      nit_ci: '123456789',
      social_reason: 'prueba',
    },
  })
  @ApiFoundResponse({
    description: 'El usuario ya existe',
    type: String,
    example: 'El usuario ya existe',
  })
  @Post('register')
  async registerUser(@Body() request: UserCreateRequestModel) {
    return this.authService.registerUser(request);
  }

  @ApiOperation({
    summary: 'Iniciar sesion',
    description: 'Iniciar sesion',
    tags: ['auth'],
    operationId: 'login',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/UserLoginRequestModel',
          },
          example: {
            email: 'prueba@gmail',
            password: PasswordService.generateStrongPassword(),
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Token de acceso del usuario',
    type: UserJwtPayloadModel,
    example: {
      access_token:
        '2ef2sdfkmsdsdflnsfdmlmsldflsdfmlkmsdfmlsdflnslfmlsdkmflkmdslfmksmlfkdmskl',
    },
  })
  @Post('login')
  async login(
    @Body() request: UserLoginRequestModel,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.loginUseCase.execute(request);
    res.cookie('access_token', response.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      domain: 'localhost',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24, // 1 día
    });
    return response.user;
  }
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('register-admin')
  async registerAdminUser(@Body() request: UserCreateRequestModel) {
    return this.authService.registerAdminUser(request);
  }
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('employee')
  async registerEmployeeUser(@Body() request: UserCreateRequestModel) {
    return this.authService.registerEmployeeUser(request);
  }
}
