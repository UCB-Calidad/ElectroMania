import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import {
  OrderCancelledEventDto,
  OrderCreatedEventDto,
  OrderUpdatedEventDto,
} from '../dto/order-event.dto';

@WebSocketGateway({
  namespace: '/orders',
  cors: {
    origin: '*',
  },
})
export class OrderGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(OrderGateway.name);
  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway inicializado en namespace: /orders');
  }
  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }
  @SubscribeMessage('order.created')
  emitOrderCreated(@MessageBody('payload') payload: OrderCreatedEventDto) {
    this.logger.log(`Emitiendo order.created para orden ${payload.order_id}`);
    this.server.emit('order.created', payload);
  }
  @SubscribeMessage('order.updated')
  emitOrderUpdated(@MessageBody('payload') payload: OrderUpdatedEventDto) {
    this.logger.log(`Emitiendo order.updated para orden ${payload.order_id}`);
    this.server.emit('order.updated', payload);
  }
  @SubscribeMessage('order.cancelled')
  emitOrderCancelled(@MessageBody('payload') payload: OrderCancelledEventDto) {
    this.logger.log(`Emitiendo order.cancelled para orden ${payload.order_id}`);
    this.server.emit('order.cancelled', payload);
  }
}
