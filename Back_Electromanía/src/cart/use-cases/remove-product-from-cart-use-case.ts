import { ForbiddenException, Injectable } from '@nestjs/common';
import { CartService } from '../service/cart.service';
import { ProductService } from '../../product/service/product.service';
import { Prisma } from '@prisma/client';
import { DeleteProductFromCartDto } from '../dto/delete-product-from-cart.dto';
import { GetActiveCartUseCase } from './get-active-cart.use-case';

@Injectable()
export class RemoveProductFromCartUseCase {
  constructor(
    private readonly cartService: CartService,
    private readonly productService: ProductService,
    private readonly getActiveCartUseCase: GetActiveCartUseCase,
  ) {}

  async execute(
    userUuid: string,
    request: DeleteProductFromCartDto,
    tx?: Prisma.TransactionClient,
  ) {
    let activeCart = await this.getActiveCartUseCase.execute(userUuid, tx);
    if (!activeCart) {
      throw new ForbiddenException('Cart not found');
    }
    const detail = await this.cartService.getCartDetailByCartAndProduct(
      activeCart.id,
      request.productId,
      tx,
    );
    if (!detail) {
      throw new ForbiddenException('Product not found in cart');
    }
    await this.productService.releaseReservedStock(
      request.productId,
      detail.quantity,
      tx,
    );
    return this.cartService.deleteCartDetailById(detail.id, tx);
  }
}
