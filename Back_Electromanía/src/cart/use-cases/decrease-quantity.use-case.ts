import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/service/prisma.service';
import { AuthService } from '../../auth/service/auth.service';
import { ProductService } from '../../product/service/product.service';
import { CartService } from '../service/cart.service';
import { UpdateCartDetailDto } from '../dto/update-cart-detail.dto';
import { RemoveProductFromCartUseCase } from './remove-product-from-cart-use-case';
import { Prisma } from '@prisma/client';

@Injectable()
export class DecreaseQuantityUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly productService: ProductService,
    private readonly cartService: CartService,
    private readonly removeProductFromCartUseCase: RemoveProductFromCartUseCase,
  ) {}
  async execute(
    uuid: string,
    request: UpdateCartDetailDto,
    tx?: Prisma.TransactionClient,
  ) {
    let activeCart = await this.cartService.getActiveCartByUser(uuid, tx);
    if (!activeCart) {
      throw new ForbiddenException('Cart not found');
    }
    const detail = await this.cartService.getCartDetailByCartAndProduct(
      activeCart.id,
      request.productId,
      tx,
    );
    if (detail) {
      if (detail.quantity < request.quantity) {
        return this.removeProductFromCartUseCase.execute(uuid, request, tx);
      }
      await this.cartService.decreaseQuantity(detail.id, request, tx);
    } else {
      throw new ForbiddenException('Product not found in cart');
    }
    await this.productService.releaseReservedStock(
      request.productId,
      request.quantity,
      tx,
    );
    return true;
  }
}
