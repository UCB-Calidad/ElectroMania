import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, expectTypeOf, it } from "vitest";
import { UserMapper } from "./User.mapper";
import { User, UserState } from "@prisma/client";
import { UserModel } from "../models/User.model";

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
        })
    })
})