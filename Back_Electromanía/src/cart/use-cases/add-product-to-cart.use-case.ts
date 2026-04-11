import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/service/prisma.service';
import { ProductService } from '../../product/service/product.service';
import { AddProductToCartRequestDto } from '../dto/addProductToCartRequest.dto';
import { CartService } from '../service/cart.service';
import { GetActiveCartUseCase } from './get-active-cart.use-case';
import { CreateCartUseCase } from './create-cart.use-case';
import { IncreaseQuantityUseCase } from './increase-quantity.use-case';

@Injectable()
export class AddProductToCartUseCase {
  logger = new Logger(AddProductToCartUseCase.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService,
    private readonly cartService: CartService,
    private readonly getActiceCartUseCase: GetActiveCartUseCase,
    private readonly createCartUseCase: CreateCartUseCase,
    private readonly increaseQuantityUseCase: IncreaseQuantityUseCase,
  ) {}
  async execute(
    userUuid: string,
    addProductRequest: AddProductToCartRequestDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      let activeCart = await this.getActiceCartUseCase.execute(userUuid, tx);
      if (!activeCart) {
        await this.cartService.createCart(userUuid, tx);
      }
      await this.increaseQuantityUseCase.execute(
        userUuid,
        addProductRequest,
        tx,
      );
      return await this.getActiceCartUseCase.execute(userUuid, tx);
    });
  }
}
