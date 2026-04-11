import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Logger,
  Query,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { OrderService } from '../service/order.service';
import { UpdateOrderDto, UpdateOrderModel } from '../dto/update-order.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CreateOrderByCartUseCase } from '../use-cases/create-order-by-cart.usecase';
import { AuthService } from '../../auth/service/auth.service';
import { ConfirmPaymentForOrderUseCase } from '../use-cases/confirm-payment-for-order.use-case';
import { UpdateOrderStatusUseCase } from '../use-cases/update-order-status.use-case';
import { GenerateOrderXmlUseCase } from '../use-cases/generate-order-xml.usecase';
import { Response } from 'express';
import { SendOrderReceiptUseCase } from '../use-cases/send-order-receipt.use-case';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserJwtPayloadModel } from '../../auth/models/user-jwt-payload.model';
import { OrderGateway } from '../gateway/order.gateway';

@Controller('order')
export class OrderController {
  logger = new Logger('OrderController');
  constructor(
    private readonly orderService: OrderService,
    private readonly authService: AuthService,
    private readonly createOrderByCart: CreateOrderByCartUseCase,
    private readonly confirmPayment: ConfirmPaymentForOrderUseCase,
    private readonly updateOrderStatus: UpdateOrderStatusUseCase,
    private readonly generateXml: GenerateOrderXmlUseCase,
    private readonly sendMail: SendOrderReceiptUseCase,
    private readonly orderGateway: OrderGateway,
  ) {}

  @UseGuards(AuthGuard)
  @Post('register')
  async register(@CurrentUser() user: UserJwtPayloadModel) {
    return this.createOrderByCart.execute(user.uuid);
  }
  @Get('all')
  async getAllOrders() {
    return this.orderService.getAll();
  }
  @Get('receipt')
  async getOrderReceipt(
    @Query('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const result = await this.generateXml.execute(id);
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(result.html);
  }
  @Post('receipt/send')
  async sendOrderReceipt(@Query('id', ParseIntPipe) id: number) {
    return this.sendMail.execute(id);
  }
  @UseGuards(AuthGuard)
  @Get()
  async getAllOrdersBy(@CurrentUser() user: UserJwtPayloadModel) {
    return this.orderService.getByUser(user.uuid);
  }

  @Get(':id')
  async pay(@Param('id') id: string, @Res() res: Response) {
    const result = await this.confirmPayment.execute(Number(id));
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(result.html);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateOrderDto: UpdateOrderDto) {
    return this.updateOrderStatus.execute(
      id,
      new UpdateOrderModel(updateOrderDto.status),
    );
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
