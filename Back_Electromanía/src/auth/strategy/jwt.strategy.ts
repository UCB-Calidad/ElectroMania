import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import Configuration from 'src/config/Configuration';
import { AuthService } from '../service/auth.service';
import { UserJwtPayloadModel } from '../models/user-jwt-payload.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Configuration().jwtConstants.secret,
    });
  }

  async validate(payload: UserJwtPayloadModel) {
    return this.authService.validateUserById(payload.uuid);
  }
}
