// src/orders/use-cases/send-order-receipt.usecase.ts
import { Injectable, Logger } from '@nestjs/common';
import { OrderService } from '../service/order.service';
import { OrderReceiptService } from '../service/order-receipt-html.service';
import { MailService } from '../../mail/service/mail.service';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/service/prisma.service';
import { PdfMakeService } from '../../common/utils/pdf/pdf-make.maker';

@Injectable()
export class SendOrderReceiptUseCase {
  logger = new Logger('SendOrderReceiptUseCase');
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderService: OrderService,
    private readonly receiptService: OrderReceiptService,
    private readonly mailService: MailService,
    private readonly pdfMaker: PdfMakeService,
  ) {}

  async execute(
    orderId: number,
    sendPdf: boolean = true,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    const order = await this.orderService.getOrderForXML(orderId, prisma);
    const userEmail = order.user.email;
    if (sendPdf) {
      // Generar PDF y enviar
      const htmlContent = this.receiptService.generateReceiptHtml(order);
      const pdfBuffer = await this.pdfMaker.generatePDF(order);
      await this.mailService.sendOrderReceipt(
        userEmail,
        order.order_id,
        pdfBuffer,
        htmlContent,
      );
    } else {
      // Enviar solo HTML
      const htmlContent = this.receiptService.generateReceiptHtml(order);
      await this.mailService.sendOrderReceiptHtml(
        userEmail,
        order.order_id,
        htmlContent,
      );
    }

    return {
      message: 'Receipt sent successfully',
      orderId: order.order_id,
      sentTo: userEmail,
    };
  }
}
