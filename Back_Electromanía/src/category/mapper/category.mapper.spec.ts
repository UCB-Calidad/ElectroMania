import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, expectTypeOf, it } from "vitest";
import { CategoryMapper } from "./category.mapper";
import { Category } from "@prisma/client";
import { CategoryModel } from "../models/category.model";


describe("CategoryMapper", () => {
    let categoryMapper;
    beforeEach(async()=>{
        const module = await Test.createTestingModule({
            providers:[CategoryMapper]
        }).compile()
        categoryMapper = module.get<CategoryMapper>(CategoryMapper)
    })
    const categoryEntity: Category = {
        category_id: 1,
        category_name: "Electronics",
        description: "Electronic devices and components"
    }
    describe("Mappeo a modelo interno",()=>{
        it("Deberia mapear una entidad a un modelo",()=>{
            const categoryModel = categoryMapper.toModel(categoryEntity)
            expect(categoryModel).toBeDefined()
            expect(categoryModel.id).toBe(categoryEntity.category_id)
            expect(categoryModel.name).toBe(categoryEntity.category_name)
            expectTypeOf(categoryModel).toEqualTypeOf<CategoryModel>()
        });
    })
})