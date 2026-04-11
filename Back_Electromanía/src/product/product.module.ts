import { Module } from '@nestjs/common';
import { ProductService } from './service/product.service';
import { ProductController } from './controller/product.controller';
import { PrismaService } from '../prisma/service/prisma.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RegisterProductUseCase } from './use-cases/register-product.use-case';
import { ProductMapper } from './mapper/Product.mapper';
import { ProductImageMapper } from './mapper/ProductImage.mapper';
import { PageProductMapper } from './mapper/PageProduct.mapper';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    PrismaService,
    AuthGuard,
    RolesGuard,
    ProductMapper,
    ProductImageMapper,
    PageProductMapper,
    RegisterProductUseCase,
  ],
  exports: [ProductService],
})
export class ProductModule {}
