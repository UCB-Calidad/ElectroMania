import { Injectable } from '@nestjs/common';
import { CartService } from '../service/cart.service';
import { PrismaService } from '../../prisma/service/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class GetActiveCartUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
  ) {}

  async execute(userUuid: string, tx?: Prisma.TransactionClient) {
    const prisma = tx || this.prisma;
    return this.cartService.getActiveCartByUser(userUuid, prisma);
  }
}
