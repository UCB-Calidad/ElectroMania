import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/service/prisma.service';
import { AuthService } from '../../auth/service/auth.service';
import { UpdateCartDetailDto } from '../dto/update-cart-detail.dto';
import { IncreaseQuantityUseCase } from './increase-quantity.use-case';
import { DecreaseQuantityUseCase } from './decrease-quantity.use-case';
import { GetActiveCartUseCase } from './get-active-cart.use-case';

@Injectable()
export class UpdateProductQuantityUseCase {
  logger = new Logger('UpdateProductQuantityUseCase');
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly increaseQuantityUseCase: IncreaseQuantityUseCase,
    private readonly decreaseQuantityUseCase: DecreaseQuantityUseCase,
    private readonly getActiceCartUseCase: GetActiveCartUseCase,
  ) {}
  async execute(userUuid: string, request: UpdateCartDetailDto) {
    if (request.quantity < 0) {
      request.quantity = Math.abs(request.quantity);
      await this.decreaseQuantityUseCase.execute(userUuid, request);
    } else {
      await this.increaseQuantityUseCase.execute(userUuid, request);
    }
    return await this.getActiceCartUseCase.execute(userUuid);
  }
}
