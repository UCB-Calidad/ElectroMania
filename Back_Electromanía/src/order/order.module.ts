import { Module } from '@nestjs/common';
import { OrderService } from './service/order.service';
import { OrderController } from './controller/order.controller';
import { ProductModule } from '../product/product.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PrismaService } from '../prisma/service/prisma.service';
import { CartService } from '../cart/service/cart.service';
import { OrderMapper } from './mapper/order.mapper';
import { CartMapper } from '../cart/mapper/cart.mapper';
import { CreateOrderByCartUseCase } from './use-cases/create-order-by-cart.usecase';
import { ProductService } from '../product/service/product.service';
import { AuthService } from '../auth/service/auth.service';
import { UserMapper } from '../user/mapper/User.mapper';
import { PasswordService } from '../common/utils/password.service';
import { JwtService } from '@nestjs/jwt';
import { ProductMapper } from '../product/mapper/Product.mapper';
import { ProductImageMapper } from '../product/mapper/ProductImage.mapper';
import { PageProductMapper } from '../product/mapper/PageProduct.mapper';
import { ConfirmPaymentForOrderUseCase } from './use-cases/confirm-payment-for-order.use-case';
import { CancelOrderUseCase } from './use-cases/cancel-order.use-case';
import { UpdateOrderStatusUseCase } from './use-cases/update-order-status.use-case';
import { GenerateOrderXmlUseCase } from './use-cases/generate-order-xml.usecase';
import { OrderReceiptService } from './service/order-receipt-html.service';
import { PaymentService } from '../payment/service/payment.service';
import { SendOrderReceiptUseCase } from './use-cases/send-order-receipt.use-case';
import { MailService } from '../mail/service/mail.service';
import { HttpModule } from '@nestjs/axios';
import { PdfMakeService } from '../common/utils/pdf/pdf-make.maker';
import { OrderGateway } from './gateway/order.gateway';

@Module({
  imports: [ProductModule, UserModule, AuthModule, HttpModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    RolesGuard,
    AuthGuard,
    PrismaService,
    CartService,
    OrderMapper,
    CartMapper,
    CreateOrderByCartUseCase,
    ProductService,
    AuthService,
    UserMapper,
    PasswordService,
    JwtService,
    ProductMapper,
    ProductImageMapper,
    PageProductMapper,
    ConfirmPaymentForOrderUseCase,
    CancelOrderUseCase,
    UpdateOrderStatusUseCase,
    GenerateOrderXmlUseCase,
    OrderReceiptService,
    PaymentService,
    SendOrderReceiptUseCase,
    MailService,
    PdfMakeService,
    OrderGateway,
  ],
})
export class OrderModule {}
