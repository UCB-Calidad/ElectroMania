import { ProductModel } from '../../product/model/Product.model';
import { CartProductModel } from './CardProduct.model';
export class CartDetailsResponseModel {
  product: CartProductModel;
  quantity: number;
  total: number;
}

export class CartDetailsResponseWithProductImagesModel {
  product: ProductModel;
  quantity: number;
  total: number;
}
