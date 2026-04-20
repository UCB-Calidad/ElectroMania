import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, expectTypeOf, it } from "vitest";
import { UserMapper } from "./User.mapper";
import { Prisma, User, UserState } from "@prisma/client";
import { UserModel } from "../models/User.model";
import { UserJwtPayloadModel } from "../../auth/models/user-jwt-payload.model";

describe("UserMapper",()=>{
    let userMapper;
    beforeEach(async()=>{
        const module = await Test.createTestingModule({
            providers:[UserMapper]
        }).compile()
        userMapper = module.get<UserMapper>(UserMapper)
    })
    const userEntity: User = {
        uuid: "123456789",
        name: "Juan",
        email: "juan@gmail.com",
        password: "123456789",
        nit_ci: "123456789",
        social_reason: "Juan S.A.",
        phone_number: "123456789",
        role: "ADMIN",
        state: UserState.ACTIVE,
        created_at: new Date(),
        updated_at: new Date()
    }
    const userModel: UserModel = {
        uuid: "123456789",
        name: "Juan",
        email: "juan@gmail.com",
        nit_ci: "123456789",
        social_reason: "Juan S.A.",
        role: "ADMIN",
        phone: "123456789"
    }
    describe("Mappear a un modelo interno",()=>{
        it("Deberia Mapear una Entidad a un Modelo de usuario",()=>{
            const userModel = userMapper.toModel(userEntity)
            expect(userModel).toBeDefined()
            expect(userModel.uuid).toBe(userEntity.uuid)
            expect(userModel.name).toBe(userEntity.name)
            expect(userModel.email).toBe(userEntity.email)
            expect(userModel.nit_ci).toBe(userEntity.nit_ci)
            expect(userModel.social_reason).toBe(userEntity.social_reason)
            expect(userModel.role).toBe(userEntity.role)
            expectTypeOf(userModel).toEqualTypeOf<UserModel>()
        });
    })
    describe("Mapear a un modelo de JWT",()=>{
        it("Deberia mapear una entidad a un modelo de JWT",()=>{
            const jwtModel = userMapper.toJwtPayloadModel(userEntity)
            expect(jwtModel).toBeDefined()
            expect(jwtModel.uuid).toBe(userEntity.uuid)
            expect(jwtModel.email).toBe(userEntity.email)
            expect(jwtModel.role).toBe(userEntity.role)
            expectTypeOf(jwtModel).toEqualTypeOf<UserJwtPayloadModel>()
        });
    })
    describe("Mapear a una entidad de registro",()=>{
        it("Deberia mapear un modelo de registro a una entidad",()=>{
            const userEntity = userMapper.toEntity(userModel);
            expect(userEntity).toBeDefined()
            expect(userEntity.name).toBe(userModel.name)
            expect(userEntity.email).toBe(userModel.email)
            expect(userEntity.nit_ci).toBe(userModel.nit_ci)
            expect(userEntity.social_reason).toBe(userModel.social_reason)
            expect(userEntity.phone_number).toBe(userModel.phone)
            expectTypeOf(userEntity).toEqualTypeOf<Prisma.UserCreateInput>()
        })
    });
    describe("Mappear a un modelo de registro",()=>{
        it("Deberia Mappear una solicitud de crear un usuario admin ",()=>{
            const userEntity = userMapper.toRegisterAdminUserEntity(userModel)
            expect(userEntity).toBeDefined()
            expect(userEntity.name).toBe(userModel.name)
            expect(userEntity.email).toBe(userModel.email)
            expect(userEntity.nit_ci).toBe(userModel.nit_ci)
            expect(userEntity.social_reason).toBe(userModel.social_reason)
            expect(userEntity.phone_number).toBe(userModel.phone)
            expect(userEntity.role).toBe("ADMIN")
            expectTypeOf(userEntity).toEqualTypeOf<Prisma.UserCreateInput>()
        })
        it("Deberia Mappear una solicitud de crear un usuario empleado ",()=>{
            const userEntity = userMapper.toRegisterEmployedUserEntity(userModel)
            expect(userEntity).toBeDefined()
            expect(userEntity.name).toBe(userModel.name)
            expect(userEntity.email).toBe(userModel.email)
            expect(userEntity.nit_ci).toBe(userModel.nit_ci)
            expect(userEntity.social_reason).toBe(userModel.social_reason)
            expect(userEntity.phone_number).toBe(userModel.phone)
            expect(userEntity.role).toBe("EMPLOYED")
            expectTypeOf(userEntity).toEqualTypeOf<Prisma.UserCreateInput>()
        });
        it("Deberia mapear una entidad a un modelo de registro",()=>{
            const userModel = userMapper.toRegisterUserModel(userEntity)
            expect(userModel).toBeDefined()
            expect(userModel.name).toBe(userEntity.name)
            expect(userModel.email).toBe(userEntity.email)
            expect(userModel.nit_ci).toBe(userEntity.nit_ci)
            expect(userModel.social_reason).toBe(userEntity.social_reason)
            expectTypeOf(userModel).toEqualTypeOf<UserRegisterResponseModel>()
        });
    });
})