import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/enums/UserRole.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserJwtPayloadModel } from '../models/user-jwt-payload.model';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}
  hasRole(roles: UserRole[], user: UserJwtPayloadModel) {
    return roles.some((role) => {
      if (user.role === role) {
        return user.role === role;
      }
    });
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserJwtPayloadModel;
    if (!user) throw new UnauthorizedException('Usuario no autenticado');
    if (!this.hasRole(requiredRoles, user)) {
      throw new ForbiddenException(
        'Acceso denegado, No tiene los permisos suficientes',
      );
    }
    return true;
  }
}
