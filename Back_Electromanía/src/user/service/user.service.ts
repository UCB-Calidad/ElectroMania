import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/service/prisma.service';
import { PasswordService } from '../../common/utils/password.service';
import { UserCreateRequestModel } from '../models/UserCreateRequest.model';
import { UserMapper } from '../mapper/User.mapper';
import { UserModel } from '../models/User.model';
import { Prisma, User } from '@prisma/client';
import { AuthService } from '../../auth/service/auth.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UserService {
  constructor(
    private readonly userMapper: UserMapper,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}
  async findAll(): Promise<User[]> {
    const cachedUserKey = 'allUsers';
    const cachedUsers = await this.cacheManager.get(cachedUserKey);
    if (cachedUsers) {
      return cachedUsers as User[];
    }
    const users = await this.prisma.user.findMany();
    await this.cacheManager.set(cachedUserKey, users, 8000);
    return users;
  }

  async getAllUsers(): Promise<UserModel[]> {
    const users = await this.findAll();
    return users.map((u) => this.userMapper.toModel(u));
  }

  async createUser(user: Prisma.UserCreateInput) {
    const allUsersKey = 'allUsers';
    this.cacheManager.del(allUsersKey);
    return this.prisma.user.create({ data: user });
  }

  async registerUser(user: UserCreateRequestModel) {
    try {
      const hashedPassword = await this.passwordService.hashPassword(
        user.password,
      );
      user.password = hashedPassword;
      const entity = this.userMapper.toEntity(user);
      const result = await this.createUser(entity);
      return this.userMapper.toRegisterUserModel(result);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('User already exists');
      }
      throw error;
    }
  }
  async getUserByUUID(uuid: string) {
    const user = await this.getUserByField('uuid', uuid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.userMapper.toModel(user);
  }

  async getUserByField(field: string, value: string) {
    return this.prisma.user.findFirst({ where: { [field]: value } });
  }

  async userExistByField(field: string, value: string) {
    return this.prisma.user.findFirst({ where: { [field]: value } }) !== null;
  }

  async filterBy(filter: Prisma.UserWhereInput) {
    const filterByKey = 'filterBy';
    const usersFiltered = await this.cacheManager.get(filterByKey);
    if (usersFiltered) {
      return usersFiltered as User[];
    }
    const users = await this.prisma.user.findMany({ where: filter });
    await this.cacheManager.set(filterByKey, users, 8000);
    return users;
  }
  async registerAdminUser(user: UserCreateRequestModel) {
    try {
      const hashedPassword = await this.passwordService.hashPassword(
        user.password,
      );
      user.password = hashedPassword;
      const entity = this.userMapper.toRegisterAdminUserEntity(user);
      const result = await this.createUser(entity);
      return this.userMapper.toRegisterUserModel(result);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('User already exists');
      }
      throw error;
    }
  }
  async registerEmployedUser(user: UserCreateRequestModel) {
    try {
      const hashedPassword = await this.passwordService.hashPassword(
        user.password,
      );
      user.password = hashedPassword;
      const entity = this.userMapper.toRegisterEmployedUserEntity(user);
      const result = await this.createUser(entity);
      return this.userMapper.toRegisterUserModel(result);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('User already exists');
      }
      throw error;
    }
  }
}
