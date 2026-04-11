import { Mapper } from 'src/common/interfaces/Mapper.interface';
import { UserModel } from '../models/User.model';
import { UserCreateRequestModel } from '../models/UserCreateRequest.model';
import { User, Cart, Prisma } from '@prisma/client';
import { UserRole } from '../enums/UserRole.enum';
import { UserRegisterResponseModel } from '../models/UserRegisterResponse.model';
import { UserJwtPayloadModel } from 'src/auth/models/user-jwt-payload.model';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserMapper implements Mapper<
  UserModel,
  User,
  Prisma.UserCreateInput,
  UserCreateRequestModel,
  Cart
> {
  toModel(entity: User): UserModel {
    const model = new UserModel();
    model.uuid = entity.uuid;
    model.name = entity.name;
    model.email = entity.email;
    model.nit_ci = entity.nit_ci;
    model.social_reason = entity.social_reason;
    model.role = entity.role;
    return model;
  }
  toEntity(model: UserCreateRequestModel): Prisma.UserCreateInput {
    return {
      name: model.name,
      email: model.email,
      password: model.password,
      nit_ci: model.nit_ci,
      social_reason: model.social_reason,
      phone_number: model.phone,
      updated_at: new Date(),
    };
  }
  toRegisterUserModel(entity: User): UserRegisterResponseModel {
    const model = new UserRegisterResponseModel();
    model.name = entity.name;
    model.email = entity.email;
    model.password = entity.password;
    model.nit_ci = entity.nit_ci;
    model.social_reason = entity.social_reason;
    return model;
  }
  toRegisterAdminUserEntity(
    model: UserCreateRequestModel,
  ): Prisma.UserCreateInput {
    return {
      name: model.name,
      email: model.email,
      password: model.password,
      nit_ci: model.nit_ci,
      social_reason: model.social_reason,
      role: 'ADMIN',
      updated_at: new Date(),
      phone_number: model.phone,
    };
  }
  toRegisterEmployedUserEntity(
    model: UserCreateRequestModel,
  ): Prisma.UserCreateInput {
    return {
      name: model.name,
      email: model.email,
      password: model.password,
      nit_ci: model.nit_ci,
      social_reason: model.social_reason,
      role: 'EMPLOYED',
      updated_at: new Date(),
      phone_number: model.phone,
    };
  }
  toJwtPayloadModel(entity: User): UserJwtPayloadModel {
    return {
      uuid: entity.uuid,
      email: entity.email,
      role: UserRole[entity.role],
    } as UserJwtPayloadModel;
  }
}
