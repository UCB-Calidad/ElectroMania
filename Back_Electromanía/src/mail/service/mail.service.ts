// src/mail/mail.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async onModuleInit() {
    try {
      await this.mailerService['transporter'].verify();
      this.logger.log('SMTP connection verified successfully ✅');
    } catch (error) {
      this.logger.error('SMTP verification failed ❌', error);
    }
  }
  async sendOrderReceipt(
    to: string,
    orderNumber: number,
    pdfBuffer: Buffer,
    htmlContent: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: `Recibo de Compra - Orden #${orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">¡Gracias por tu compra!</h2>
            <p>Hola,</p>
            <p>Tu orden <strong>#${orderNumber}</strong> ha sido procesada exitosamente.</p>
            <p>Adjunto encontrarás el recibo detallado de tu compra en formato PDF.</p>
            <div style="margin: 30px 0; padding: 20px; background: #f0f9ff; border-radius: 8px;">
              <h3 style="margin: 0 0 10px 0; color: #0369a1;">📋 Resumen de la orden</h3>
              <p style="margin: 5px 0;">Orden: #${orderNumber}</p>
              <p style="margin: 5px 0;">Puedes revisar los detalles completos en el PDF adjunto.</p>
            </div>
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p style="color: #64748b; font-size: 12px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
          </div>
        `,
        attachments: [
          {
            filename: `recibo-orden-${orderNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      this.logger.log(
        `Receipt email sent successfully to ${to} for order #${orderNumber}`,
      );
    } catch (error) {
      this.logger.error(`Error sending receipt email: ${error.message}`);
      throw error;
    }
  }

  // También puedes enviar solo el HTML si prefieres
  async sendOrderReceiptHtml(
    to: string,
    orderNumber: number,
    htmlContent: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: `Recibo de Compra - Orden #${orderNumber}`,
        html: htmlContent,
      });
    } catch (error) {
      this.logger.error(`Error sending HTML receipt: ${error.message}`);
      throw error;
    }
  }
}
