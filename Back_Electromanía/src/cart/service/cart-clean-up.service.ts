import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/service/prisma.service';
import { CartState } from '../enums/CartState.enum';
import { ProductService } from '../../product/service/product.service';

@Injectable()
export class CartCleanUpService {
  private readonly logger = new Logger(CartCleanUpService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async cleanUpInactiveCarts() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    this.logger.log('🧹 Iniciando limpieza de carritos inactivos...');

    const expiredCarts = await this.prisma.cart.findMany({
      where: {
        updated_at: {
          lt: oneHourAgo,
        },
        state: CartState.ACTIVE,
      },
      include: {
        cartDetails: {
          include: {
            product: true,
          },
        },
      },
    });

    if (expiredCarts.length === 0) {
      this.logger.log('✅ No hay carritos para limpiar');
      return;
    }

    this.logger.log(`📦 Encontrados ${expiredCarts.length} carritos expirados`);

    for (const cart of expiredCarts) {
      try {
        await this.prisma.$transaction(async (tx) => {
          for (const detail of cart.cartDetails) {
            await this.productService.releaseReservedStock(
              detail.product_id,
              detail.quantity,
              tx,
            );
            this.logger.debug(
              `  ↩️  Liberado stock: ${detail.quantity}x Producto #${detail.product_id}`,
            );
          }
          await tx.cart.update({
            where: { cart_id: cart.cart_id },
            data: { state: CartState.EXPIRED },
          });
          this.logger.log(`✅ Carrito #${cart.cart_id} marcado como EXPIRADO`);
        });
      } catch (error) {
        this.logger.error(
          `❌ Error al limpiar carrito #${cart.cart_id}:`,
          error,
        );
      }
    }

    this.logger.log(
      `🎉 Limpieza completada: ${expiredCarts.length} carritos procesados`,
    );
  }
}
