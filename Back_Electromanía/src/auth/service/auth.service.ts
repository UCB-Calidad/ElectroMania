import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/service/prisma.service';
import { UserMapper } from '../../user/mapper/User.mapper';
import { UserCreateRequestModel } from '../../user/models/UserCreateRequest.model';
import { UserService } from '../../user/service/user.service';
import { UserLoginRequestModel } from '../models/user-login.model';
import { PasswordService } from '../../common/utils/password.service';
import { JwtService } from '@nestjs/jwt';
import { UserJwtPayloadModel } from '../models/user-jwt-payload.model';
import { LoginResponseModel } from '../models/login-response.model';
import config from '../../config/Configuration';

@Injectable()
export class AuthService {
  constructor(
    private readonly userMapper: UserMapper,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}
  async validateToken(token: string) {
    try {
      return this.jwtService.verify<UserJwtPayloadModel>(token, {
        secret: config().jwtConstants.secret,
      });
    } catch (error) {
      switch (error.name) {
        case 'TokenExpiredError':
          throw new UnauthorizedException('Token Expirado');
        case 'JsonWebTokenError':
          throw new UnauthorizedException('Token Invalido');
        default:
          throw new UnauthorizedException('Token generico invalido');
      }
    }
  }
  async generateToken(user: UserJwtPayloadModel) {
    return new LoginResponseModel(this.jwtService.sign({ user }));
  }

  async login(loginRequest: UserLoginRequestModel) {
    const user = await this.userService.getUserByField(
      'email',
      loginRequest.email,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    const isValidPassword = await this.passwordService.comparePassword(
      loginRequest.password,
      user.password,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    const payload = this.userMapper.toJwtPayloadModel(user);
    return this.generateToken(payload);
  }

  async registerUser(request: UserCreateRequestModel) {
    try {
      return await this.userService.registerUser(request);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }
  async validateUserById(uuid: string) {
    return this.userService.getUserByField('uuid', uuid);
  }
  async getUserFromToken(token: string) {
    const verify = await this.validateToken(token);
    if (verify) {
      return this.userService.getUserByField('uuid', verify.uuid);
    }
    throw new UnauthorizedException('Invalid Token');
  }

  async registerAdminUser(request: UserCreateRequestModel) {
    try {
      return await this.userService.registerAdminUser(request);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }
  async registerEmployeeUser(request: UserCreateRequestModel) {
    try {
      return await this.userService.registerEmployedUser(request);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }
  private handlePrismaError(error: any) {
    switch (error.code) {
      case 'P2002':
        throw new UnauthorizedException('Email already in use');
      case 'P2003':
        throw new UnauthorizedException('Role Invalido');
      default:
        throw new UnauthorizedException('Error registering user');
    }
  }
}
