import { beforeEach, describe, expect, it } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { CartMapper } from './cart.mapper';
import { Prisma, ProductState } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/client";

describe("CartMapper", () => {
    let cartMapper: CartMapper;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CartMapper]
        }).compile();
        cartMapper = module.get<CartMapper>(CartMapper);
    });

    const cartEntity = {
        cart_id: 1,
        user_uuid: "123e4567-e89b-12d3-a456-426614174000",
        cartDetails: [
            {
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
            }
        ]
    };

    describe("Mapear a un modelo de respuesta", () => {
        it("Deberia mapear una entidad de carrito a un modelo de respuesta", () => {
            const result = cartMapper.toModel(cartEntity as any);
            expect(result).toBeDefined();
            expect(result.id).toBe(cartEntity.cart_id);
            expect(result.userUUID).toBe(cartEntity.user_uuid);
            expect(result.details).toHaveLength(1);
            expect(result.total).toBe(200);
        });
    });

    describe("Mapear a un modelo de orden", () => {
        it("Deberia mapear una entidad de carrito a un modelo de orden sin imagenes de producto", () => {
            const cartEntityWithoutImages = {
                cart_id: 1,
                user_uuid: "123e4567-e89b-12d3-a456-426614174000",
                cartDetails: [
                    {
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
                    }
                ]
            };
            const result = cartMapper.toOrderModel(cartEntityWithoutImages as any);
            expect(result).toBeDefined();
            expect(result.id).toBe(cartEntityWithoutImages.cart_id);
            expect(result.userUUID).toBe(cartEntityWithoutImages.user_uuid);
            expect(result.details).toHaveLength(1);
            expect(result.total).toBe(200);
        });
    });
});