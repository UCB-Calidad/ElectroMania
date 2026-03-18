import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UserModel } from '../models/User.model';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserJwtPayloadModel } from '../../auth/models/user-jwt-payload.model';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '../enums/UserRole.enum';
@Controller("users")
export class UserController {
    constructor(private readonly userService: UserService){}
    @Roles(UserRole.ADMIN)
    @UseGuards(AuthGuard,RolesGuard)
    @Get("all")
    async getAllUsers(): Promise<UserModel[]> {
        return await this.userService.getAllUsers();
    }
    @UseGuards(AuthGuard)
    @Get("get")
    async getUserByUUID(@CurrentUser() user:UserJwtPayloadModel): Promise<UserModel> {
        return await this.userService.getUserByUUID(user.uuid);
    }
}
