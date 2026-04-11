import { Module } from '@nestjs/common';
import { CartController } from './controller/cart.controller';
import { CartService } from './service/cart.service';
import { PrismaService } from '../prisma/service/prisma.service';
import { ProductModule } from '../product/product.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CartMapper } from './mapper/cart.mapper';
import { AddProductToCartUseCase } from './use-cases/add-product-to-cart.use-case';
import { UpdateProductQuantityUseCase } from './use-cases/update-product-quantity.use-case';
import { IncreaseQuantityUseCase } from './use-cases/increase-quantity.use-case';
import { DecreaseQuantityUseCase } from './use-cases/decrease-quantity.use-case';
import { GetActiveCartUseCase } from './use-cases/get-active-cart.use-case';
import { RemoveProductFromCartUseCase } from './use-cases/remove-product-from-cart-use-case';
import { CreateCartUseCase } from './use-cases/create-cart.use-case';
import { CartCleanUpService } from './service/cart-clean-up.service';

@Module({
  imports: [ProductModule, UserModule, AuthModule],
  controllers: [CartController],
  providers: [
    CartService,
    RolesGuard,
    AuthGuard,
    PrismaService,
    CartMapper,
    AddProductToCartUseCase,
    UpdateProductQuantityUseCase,
    IncreaseQuantityUseCase,
    DecreaseQuantityUseCase,
    GetActiveCartUseCase,
    RemoveProductFromCartUseCase,
    CreateCartUseCase,
    CartCleanUpService,
  ],
  exports: [CartService, GetActiveCartUseCase],
})
export class CartModule {}
