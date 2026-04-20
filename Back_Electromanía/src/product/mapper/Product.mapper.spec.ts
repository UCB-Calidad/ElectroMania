import { beforeEach, describe, expect, it } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { ProductMapper } from './Product.mapper';
import { ProductState, Product } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/client";

describe("ProductMapper", () => {
    let productMapper: ProductMapper;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ProductMapper]
        }).compile();
        productMapper = module.get<ProductMapper>(ProductMapper);
    });

    const productEntity: Product = {
        product_id: 1,
        product_name: "Producto 1",
        description: "Descripcion del producto 1",
        price: new Decimal(100),
        stock_total: 10,
        stock_reserved: 2,
        state: ProductState.AVAILABLE,
        category_id: 1
    } as any;

    const productWithImagesEntity = {
        product_id: 1,
        product_name: "Producto 1",
        description: "Descripcion del producto 1",
        price: new Decimal(100),
        stock_total: 10,
        stock_reserved: 2,
        state: ProductState.AVAILABLE,
        category_id: 1,
        productImages: [
            { product_id: 1, image: "imagen1.jpg" },
            { product_id: 1, image: "imagen2.jpg" }
        ]
    };

    const productWithCategoriesEntity = {
        product_id: 1,
        product_name: "Producto 1",
        description: "Descripcion del producto 1",
        price: new Decimal(100),
        stock_total: 10,
        stock_reserved: 2,
        state: ProductState.AVAILABLE,
        category_id: 1,
        productCategories: [
            { category: { category_id: 1, category_name: "Categoria 1", description: "Descripcion 1" } }
        ]
    };

    const productWithCategoriesAndImagesEntity = {
        product_id: 1,
        product_name: "Producto 1",
        description: "Descripcion del producto 1",
        price: new Decimal(100),
        stock_total: 10,
        stock_reserved: 2,
        state: ProductState.AVAILABLE,
        category_id: 1,
        productImages: [
            { product_id: 1, image: "imagen1.jpg" }
        ],
        productCategories: [
            { category: { category_id: 1, category_name: "Categoria 1", description: "Descripcion 1" } }
        ]
    };

    describe("Mapear a un modelo", () => {
        it("Deberia mapear una entidad de producto a un modelo de producto", () => {
            const result = productMapper.toModel(productEntity);
            expect(result).toBeDefined();
            expect(result.product_id).toBe(productEntity.product_id);
            expect(result.product_name).toBe(productEntity.product_name);
            expect(result.description).toBe(productEntity.description);
            expect(result.price).toBe(100);
            expect(result.stock).toBe(8);
        });
    });

    describe("Mapear a un modelo de carrito", () => {
        it("Deberia mapear una entidad de producto a un modelo de carrito con imagenes", () => {
            const result = productMapper.toCartProduct(productWithImagesEntity as any);
            expect(result).toBeDefined();
            expect(result.product_id).toBe(productWithImagesEntity.product_id);
            expect(result.product_name).toBe(productWithImagesEntity.product_name);
            expect(result.price).toBe(100);
            expect((result as any).images).toHaveLength(2);
        });
    });
});