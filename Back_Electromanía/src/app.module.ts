import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import Configuration from './config/Configuration';
import { CartModule } from './cart/cart.module';
import { CategoryModule } from './category/category.module';
import { OrderModule } from './order/order.module';
import { MailModule } from './mail/mail.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    CommonModule,
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [Configuration],
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    ProductModule,
    AuthModule,
    CartModule,
    CategoryModule,
    OrderModule,
    MailModule,
    CacheModule.register({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
