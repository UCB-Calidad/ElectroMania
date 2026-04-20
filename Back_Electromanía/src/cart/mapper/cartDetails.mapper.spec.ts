import { beforeEach, describe, expect, it } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { CartDetailsMapper } from './cartDetails.mapper';
import { ProductState } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/client";

describe("CartDetailsMapper", () => {
    let cartDetailsMapper: CartDetailsMapper;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CartDetailsMapper]
        }).compile();
        cartDetailsMapper = module.get<CartDetailsMapper>(CartDetailsMapper);
    });

    const cartDetailEntity = {
        quantity: 2,
        unit_price: new Decimal(100),
        product: {
            product_id: 1,
            product_name: "Producto 1",
            price: new Decimal(100),
            productImages: [
                {
                    product_id: 1,
                    image: "imagen1.jpg"
                }
            ],
            state: ProductState.AVAILABLE,
            stock_total: 10,
            stock_reserved: 2,
            description: "Descripcion del producto 1"
        }
    };

    const cartDetailEntityWithoutImages = {
        quantity: 2,
        unit_price: new Decimal(100),
        product: {
            product_id: 1,
            product_name: "Producto 1",
            price: new Decimal(100),
            state: ProductState.AVAILABLE,
            stock_total: 10,
            stock_reserved: 2,
            description: "Descripcion del producto 1"
        }
    };

    describe("Mapear a un modelo de respuesta", () => {
        it("Deberia mapear una entidad de detalle de carrito a un modelo de respuesta", () => {
            const result = cartDetailsMapper.toModel(cartDetailEntity as any);
            expect(result).toBeDefined();
            expect(result.quantity).toBe(cartDetailEntity.quantity);
            expect(result.total).toBe(200);
        });
    });

    describe("Mapear a un modelo sin imagenes de producto", () => {
        it("Deberia mapear una entidad de detalle de carrito a un modelo sin imagenes", () => {
            const result = cartDetailsMapper.toModelWithoutProductImages(cartDetailEntityWithoutImages as any);
            expect(result).toBeDefined();
            expect(result.quantity).toBe(cartDetailEntityWithoutImages.quantity);
            expect(result.total).toBe(200);
        });
    });
});