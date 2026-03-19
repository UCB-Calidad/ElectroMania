import { UserLoginRequestModel } from "../models/user-login.model";
import { AuthService } from "../service/auth.service";
import { UserService } from "../../user/service/user.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PasswordService } from '../../common/utils/password.service';
import { UserMapper } from '../../user/mapper/User.mapper';
import { LoginResponseModel } from "../models/login-response.model";

@Injectable()
export class LoginUseCase {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly passwordService: PasswordService,
        private readonly userMapper: UserMapper
    ){}
    async execute(loginUserRequest:UserLoginRequestModel):Promise<LoginResponseModel> {
        const user = await this.userService.getUserByField('email', loginUserRequest.email);
        if(!user) throw new UnauthorizedException("Invalid Credentials");
        const isValidPassword = await this.passwordService.comparePassword(loginUserRequest.password, user.password);
        if(!isValidPassword) throw new UnauthorizedException("Password Invalido");
        const payload = this.userMapper.toJwtPayloadModel(user);
        const token = await this.authService.generateToken(payload);
        const response = new LoginResponseModel(token.access_token);
        response.user = this.userMapper.toModel(user);
        return response;
    }
}