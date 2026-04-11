import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { CommonModule } from '../common/common.module';
import { PrismaService } from '../prisma/service/prisma.service';
import { UserMapper } from './mapper/User.mapper';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CommonModule, forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [UserService, PrismaService, UserMapper],
  exports: [UserService],
})
export class UserModule {}
