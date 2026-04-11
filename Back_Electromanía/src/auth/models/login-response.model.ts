import { IsJWT, IsString } from 'class-validator';
import { UserModel } from '../../user/models/User.model';

export class LoginResponseModel {
  @IsString()
  @IsJWT()
  access_token: string;
  user: UserModel;
  constructor(access_token: string) {
    this.access_token = access_token;
  }
}
