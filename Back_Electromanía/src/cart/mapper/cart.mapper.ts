import { Prisma } from '@prisma/client';
import { CartResponseModel } from '../models/cart.model';
import { CartDetailsMapper } from './cartDetails.mapper';

type CartEntity = Prisma.CartGetPayload<{
  include: {
    cartDetails: {
      include: {
        product: {
          include: {
            productImages: true;
          };
        };
      };
    };
  };
}>;

type CartWithoutProductImages = Prisma.CartGetPayload<{
  include: {
    cartDetails: {
      include: {
        product: true;
      };
    };
  };
}>;

export class CartMapper {
  private readonly cartDetailsMapper = new CartDetailsMapper();
  toModel(entity: CartEntity): CartResponseModel {
    const model = new CartResponseModel();
    model.id = entity.cart_id;
    model.userUUID = entity.user_uuid;
    model.details = entity.cartDetails.map((detail) =>
      this.cartDetailsMapper.toModel(detail),
    );
    model.total = model.details.reduce((sum, d) => sum + d.total, 0);
    return model;
  }
  toOrderModel(entity: CartWithoutProductImages): CartResponseModel {
    const model = new CartResponseModel();
    model.id = entity.cart_id;
    model.userUUID = entity.user_uuid;
    model.details = entity.cartDetails.map((detail) =>
      this.cartDetailsMapper.toModelWithoutProductImages(detail),
    );
    model.total = model.details.reduce((sum, d) => sum + d.total, 0);
    return model;
  }
}
