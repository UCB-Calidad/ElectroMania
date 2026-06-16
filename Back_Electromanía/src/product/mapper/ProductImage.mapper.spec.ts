import { beforeEach, describe, expect, it } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { ProductImageMapper } from './ProductImage.mapper';
import { ProductState, Product, ProductImage } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/client";

describe("ProductImageMapper", () => {
    let productImageMapper: ProductImageMapper;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ProductImageMapper]
        }).compile();
        productImageMapper = module.get<ProductImageMapper>(ProductImageMapper);
    });

    const productImageEntity: ProductImage & {
        product: Product & { productImages: ProductImage[] };
    } = {
        product_id: 1,
        image: "imagen1.jpg",
        product: {
            product_id: 1,
            product_name: "Producto 1",
            description: "Descripcion del producto 1",
            price: new Decimal(100),
            stock_total: 10,
            stock_reserved: 2,
            state: ProductState.AVAILABLE,
            category_id: 1,
            productImages: [
                {
                    product_id: 1,
                    image: "imagen1.jpg"
                }
            ]
        }
    } as any;

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

    describe("Mapear a un modelo", () => {
        it("Deberia mapear una entidad de imagen de producto a un modelo de producto", () => {
            const result = productImageMapper.toModel(productImageEntity);
            expect(result).toBeDefined();
            expect(result.product_id).toBe(productImageEntity.product_id);
            expect(result.product_name).toBe(productImageEntity.product.product_name);
            expect(result.description).toBe(productImageEntity.product.description);
            expect(result.price).toBe(100);
            expect(result.stock).toBe(8);
        });
    });

    describe("Mapear a una entidad", () => {
        it("Deberia mapear un modelo de registro a una entidad de imagen de producto", () => {
            const model = { image_url: "nueva_imagen.jpg" } as any;
            const result = productImageMapper.toEntity(model, productEntity);
            expect(result).toBeDefined();
            expect(result.image).toBe("nueva_imagen.jpg");
            expect(result.product).toBeDefined();
            expect(result.product).toBeDefined();
            expect((result.product as any).connect.product_id).toBe(1);
        });
    });
});