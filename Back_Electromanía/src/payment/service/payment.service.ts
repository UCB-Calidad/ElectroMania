import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/service/prisma.service';
import { RegisterPaymentDto } from '../dto/register-payment.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async registerPayment(
    orderId: number,
    dto: RegisterPaymentDto,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    return await prisma.payment.create({
      data: {
        amount: dto.amount,
        method: dto.method,
        status: dto.status,
        order: {
          connect: {
            order_id: orderId,
          },
        },
      },
    });
  }
}
