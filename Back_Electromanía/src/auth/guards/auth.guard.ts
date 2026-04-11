import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import Configuration from '../../config/Configuration';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  constructor(private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      this.logger.warn('No se proporcionó un token de autenticación');
      throw new UnauthorizedException('Debe Iniciar Sesion');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: Configuration().jwtConstants.secret,
      });
      request['user'] = payload.user;
      return true;
    } catch (error) {
      this.logger.warn('Token de autenticación inválido');
      this.logger.error(error);
      throw new UnauthorizedException('Token Invalido');
    }
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const token = request.cookies?.access_token || '';
    return token;
  }
}
