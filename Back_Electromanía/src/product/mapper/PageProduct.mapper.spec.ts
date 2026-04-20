import { beforeEach, describe, expect, it } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { PageProductMapper } from './PageProduct.mapper';
import { ProductModel } from '../model/Product.model';

describe("PageProductMapper", () => {
    let pageProductMapper: PageProductMapper;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PageProductMapper]
        }).compile();
        pageProductMapper = module.get<PageProductMapper>(PageProductMapper);
    });

    describe("toResponse", () => {
        it("Deberia mapear productos a un modelo de respuesta paginada", () => {
            const products: ProductModel[] = [
                { product_id: 1, product_name: "Producto 1", description: "Desc", price: 100, stock: 10, state: "AVAILABLE" as any }
            ];
            const result = pageProductMapper.toResponse(1, products);
            expect(result).toBeDefined();
            expect(result.page).toBe(1);
            expect(result.content).toHaveLength(1);
            expect(result.totalElements).toBe(1);
        });
    });
});