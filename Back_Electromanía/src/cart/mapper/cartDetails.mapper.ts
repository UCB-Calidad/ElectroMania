import { Prisma } from '@prisma/client';
import { CartDetailsResponseModel } from '../models/cartDetails.model';
import { ProductMapper } from '../../product/mapper/Product.mapper';

type CartDetailEntity = Prisma.CartDetailsGetPayload<{
  include: {
    product:{
      include: {
        productImages: true;
      }
    };
  };
}>;

type CartDetailsWithoutProductImages = Prisma.CartDetailsGetPayload<{
  include: {
    product: true;
  }
}>;

export class CartDetailsMapper {
    productMapper = new ProductMapper();
  toModel(entity: CartDetailEntity): CartDetailsResponseModel {
    const model = new CartDetailsResponseModel();

    if(entity.product) {
      model.product = this.productMapper.toCartProduct(entity.product);
    }else{
        throw new Error('Product not found');
    }
    model.quantity = entity.quantity;
    model.total = entity.quantity * Number(entity.unit_price);
    return model;
  }
  toModelWithoutProductImages(entity: CartDetailsWithoutProductImages): CartDetailsResponseModel {
    const model = new CartDetailsResponseModel();
    model.product = this.productMapper.toModelWithoutProductImages(entity.product);
    model.quantity = entity.quantity;
    model.total = entity.quantity * Number(entity.unit_price);
    return model;
  }

  toOrderItem(entity: CartDetailsResponseModel):Prisma.OrderItemCreateWithoutOrderInput {
    return {
      quantity: entity.quantity,
      unit_price: entity.product.price,
      total: entity.total,
      product: {
        connect: {
          product_id: entity.product.product_id,
        },
      },
      product_name: entity.product.product_name
    }
  }
//   // ✅ Create DTO → Prisma input
//   toEntity(
//     dto: CreateCartRequestDto,
//   ): Prisma.CartDetailsCreateWithoutCartInput {
//     return {
//       quantity: dto.quantity,
//       unit_price: dto.unitPrice,
//       sub_total: dto.quantity * Number(dto.unitPrice),
//       product: {
//         connect: {
//           product_id: dto.productId,
//         },
//       },
//     };
//   }
}
