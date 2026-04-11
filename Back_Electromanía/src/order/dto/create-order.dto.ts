import { CartResponseModel } from '../../cart/models/cart.model';
export class CreateOrderDto {
  user_uuid: string;
  cart: CartResponseModel;
}
