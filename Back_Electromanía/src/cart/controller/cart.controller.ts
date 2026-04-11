import { Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { DeleteProductFromCartDto } from '../dto/delete-product-from-cart.dto';
import { AddProductToCartUseCase } from '../use-cases/add-product-to-cart.use-case';
import { UpdateCartDetailDto } from '../dto/update-cart-detail.dto';
import { UpdateProductQuantityUseCase } from '../use-cases/update-product-quantity.use-case';
import { GetActiveCartUseCase } from '../use-cases/get-active-cart.use-case';
import { RemoveProductFromCartUseCase } from '../use-cases/remove-product-from-cart-use-case';
import { CreateCartUseCase } from '../use-cases/create-cart.use-case';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserJwtPayloadModel } from '../../auth/models/user-jwt-payload.model';

@Controller('cart')
export class CartController {
  logger = new Logger(CartController.name);
  constructor(
    private readonly removeProductFromCartUseCase: RemoveProductFromCartUseCase,
    private readonly addProductToCartUseCase: AddProductToCartUseCase,
    private readonly updateCartDetails: UpdateProductQuantityUseCase,
    private readonly getActiveCartUseCase: GetActiveCartUseCase,
    private readonly createCartUseCase: CreateCartUseCase,
  ) {}

  @UseGuards(AuthGuard)
  @Post('create')
  async createCart(@CurrentUser() user: UserJwtPayloadModel) {
    return this.createCartUseCase.execute(user.uuid);
  }

  @UseGuards(AuthGuard)
  @Get('')
  async getCart(@CurrentUser() user: UserJwtPayloadModel) {
    return this.getActiveCartUseCase.execute(user.uuid);
  }

  @UseGuards(AuthGuard)
  @Post('addProduct')
  async addProductToCart(
    @CurrentUser() user: UserJwtPayloadModel,
    @Body() updateRequest: UpdateCartDetailDto,
  ) {
    return this.addProductToCartUseCase.execute(user.uuid, updateRequest);
  }
  @UseGuards(AuthGuard)
  @Post('deleteProduct')
  async deleteProductToCart(
    @CurrentUser() user: UserJwtPayloadModel,
    @Body() deleteRequest: DeleteProductFromCartDto,
  ) {
    return this.removeProductFromCartUseCase.execute(user.uuid, deleteRequest);
  }
  @UseGuards(AuthGuard)
  @Post('update')
  async updateCartDetail(
    @CurrentUser() user: UserJwtPayloadModel,
    @Body() addProduct: UpdateCartDetailDto,
  ) {
    return this.updateCartDetails.execute(user.uuid, addProduct);
  }
}
