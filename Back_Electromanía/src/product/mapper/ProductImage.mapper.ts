import { ProductModel } from '../model/Product.model';
import { RegisterProductImageRequestModel } from '../model/RegisterProductImageRequest.model';
import { Product, Prisma } from '@prisma/client';

type ProductImageWithProduct = Prisma.ProductImageGetPayload<{
  include: { product: { include: { productImages: true } } };
}>;

export class ProductImageMapper {
  toModel(entity: ProductImageWithProduct): ProductModel {
    const model = new ProductModel();
    model.product_id = entity.product_id;
    model.product_name = entity.product.product_name;
    model.description = entity.product.description;
    model.price = Number(entity.product.price);
    model.stock = entity.product.stock_total - entity.product.stock_reserved;
    model.state = entity.product.state;
    return model;
  }

  toEntity(
    model: RegisterProductImageRequestModel,
    product: Product,
  ): Prisma.ProductImageCreateInput {
    return {
      product: {
        connect: { product_id: product.product_id },
      },
      image: model.image_url,
    };
  }
}
