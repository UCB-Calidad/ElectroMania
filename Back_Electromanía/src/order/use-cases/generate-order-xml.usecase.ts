import { Injectable } from '@nestjs/common';
import { OrderService } from '../service/order.service';
import { OrderReceiptService } from '../service/order-receipt-html.service';
import { PrismaService } from '../../prisma/service/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class GenerateOrderXmlUseCase {
  constructor(
    private readonly orderService: OrderService,
    private readonly html: OrderReceiptService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(orderId: number, tx?: Prisma.TransactionClient) {
    const prisma = tx || this.prisma;
    const order = await this.orderService.getOrderForXML(orderId, prisma);
    const html = this.html.generateReceiptHtml(order);
    return {
      html,
    };
  }
}
