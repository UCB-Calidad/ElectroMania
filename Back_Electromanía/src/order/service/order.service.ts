import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto, UpdateOrderModel } from '../dto/update-order.dto';
import { PrismaService } from '../../prisma/service/prisma.service';
import { AuthService } from '../../auth/service/auth.service';
import { CartService } from '../../cart/service/cart.service';
import { CartState, Order, Prisma } from '@prisma/client';
import { OrderMapper } from '../mapper/order.mapper';
import { CartResponseModel } from '../../cart/models/cart.model';
import { OrderResponseModel } from '../models/order-response.model';
import { UserService } from '../../user/service/user.service';
import { CartUpdateRequest } from '../../cart/models/CartUpdateRequest.model';
import { CacheOrderKeys } from '../cache/cache-orders.keys';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const CACHE_TTL = 8000;

@Injectable()
export class OrderService {
  logger = new Logger(OrderService.name);
  constructor(
    readonly prisma: PrismaService,
    readonly userService: UserService,
    readonly authService: AuthService,
    readonly cartService: CartService,
    readonly orderMapper: OrderMapper,
    @Inject(CACHE_MANAGER) private readonly cacheManager:Cache
  ) {}
  // ==================== Public Methods ====================

  async create(createOrderDto: Prisma.OrderCreateInput, tx?: Prisma.TransactionClient) {
    const prisma = this.getPrismaClient(tx);
    return await this.insertOrder(createOrderDto, prisma);
  }

  private async insertOrder(createOrderDto: Prisma.OrderCreateInput, prisma: Prisma.TransactionClient | PrismaService) {
    return await prisma.order.create({
      data: createOrderDto,
      include: this.getOrderIncludes(),
    });
  }

  async register(uuid: string, cart: CartResponseModel, tx?: Prisma.TransactionClient): Promise<OrderResponseModel> {
    const orderData = this.buildOrderData(cart);
    const order = await this.create(orderData, tx);
    const response = this.orderMapper.toResponseModel(order as any);
    await this.updateCacheAfterCreate(order.order_id, cart.userUUID, response);
    return response; 
  }

  private buildOrderData(cart: CartResponseModel): Prisma.OrderCreateInput {
    const request: CreateOrderDto = {
      user_uuid: cart.userUUID,
      cart: cart,
    };
    return this.orderMapper.toRegisterEntity(request);
  }

  private async updateCacheAfterCreate(orderId: number, userUuid: string, response: OrderResponseModel): Promise<void> {
    this.clearOrderCache(userUuid);
    this.clearAllOrdersCache();
    await this.cacheManager.set(CacheOrderKeys.orderByID(orderId), response, CACHE_TTL);
  }

  async getByUser(userUuid: string): Promise<OrderResponseModel[]> {
    const cached = await this.getCachedOrdersByUser(userUuid);
    if (cached) return cached;

    const orders = await this.fetchOrdersByUser(userUuid);
    const response = this.mapOrdersToResponse(orders);
    await this.cacheOrdersByUser(userUuid, response);
    return response;
  }

  private async fetchOrdersByUser(userUuid: string) {
    return await this.prisma.order.findMany({
      where: this.buildUserOrderFilter(userUuid),
      include: this.getOrderIncludes(),
    });
  }

  private buildUserOrderFilter(userUuid: string): Prisma.OrderWhereInput {
    return {
      userOrders: {
        some: { user_uuid: userUuid }
      }
    };
  }

  private mapOrdersToResponse(orders: any[]): OrderResponseModel[] {
    return orders.map((o) => this.orderMapper.toResponseModel(o));
  }

  private async cacheOrdersByUser(userUuid: string, orders: OrderResponseModel[]): Promise<void> {
    await this.cacheManager.set(CacheOrderKeys.orderByUser(userUuid), orders, CACHE_TTL);
  }

  // ==================== Cache Management ====================

  private clearOrderCache(userUuid: string): void {
    this.cacheManager.del(CacheOrderKeys.orderByUser(userUuid));
  }

  clearCachedOrderById(orderId: number): void {
    this.cacheManager.del(CacheOrderKeys.orderByID(orderId));
  }

  private clearAllOrdersCache(): void {
    this.cacheManager.del(CacheOrderKeys.allOrders);
  }

  private async getAllCachedOrders(): Promise<OrderResponseModel[] | null> {
    const cached = await this.cacheManager.get(CacheOrderKeys.allOrders);
    return cached ? (cached as OrderResponseModel[]) : null;
  }

  private async getCahedOrderById(orderId: number): Promise<OrderResponseModel | null> {
    const cached = await this.cacheManager.get(CacheOrderKeys.orderByID(orderId));
    return cached ? (cached as OrderResponseModel) : null;
  }

  private async getCachedOrdersByUser(userUuid: string): Promise<OrderResponseModel[] | null> {
    const cached = await this.cacheManager.get(CacheOrderKeys.orderByUser(userUuid));
    return cached ? (cached as OrderResponseModel[]) : null;
  }

  async getAll(): Promise<OrderResponseModel[]> {
    const cached = await this.getAllCachedOrders();
    if (cached) return cached;

    const orders = await this.fetchAllOrders();
    const response = this.mapOrdersToResponse(orders);
    await this.cacheAllOrders(response);
    return response;
  }

  private async fetchAllOrders() {
    return await this.prisma.order.findMany({
      include: this.getOrderIncludes(),
    });
  }

  private async cacheAllOrders(orders: OrderResponseModel[]): Promise<void> {
    await this.cacheManager.set(CacheOrderKeys.allOrders, orders, CACHE_TTL);
  }

  async getById(id: number): Promise<OrderResponseModel> {
    const cached = await this.getCahedOrderById(id);
    if (cached) return cached;

    const order = await this.findOrderById(id);
    const response = this.orderMapper.toResponseModel(order as any);
    await this.cacheOrderById(id, response);
    return response;
  }

  private async findOrderById(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { order_id: id },
      include: this.getOrderIncludes(),
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  private async cacheOrderById(orderId: number, order: OrderResponseModel): Promise<void> {
    await this.cacheManager.set(CacheOrderKeys.orderByID(orderId), order, CACHE_TTL);
  }


  async getOrderForXML(id: number, tx?: Prisma.TransactionClient) {
    const prisma = this.getPrismaClient(tx);
    const order = await this.fetchOrderForReceipt(id, prisma);
    return this.orderMapper.toOrderReceiptModel(order as any);
  }

  private async fetchOrderForReceipt(id: number, prisma: Prisma.TransactionClient | PrismaService) {
    const order = await prisma.order.findUnique({
      where: { order_id: id },
      include: this.getOrderReceiptIncludes(id),
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  private getOrderReceiptIncludes(orderId: number): Prisma.OrderInclude {
    return {
      orderItems: true,
      payment: {
        where: { order_id: orderId }
      },
      cart: {
        include: {
          user: {
            omit: { password: true }
          }
        }
      }
    };
  }

  async update(id: number, updateOrderDto: UpdateOrderModel, tx?: Prisma.TransactionClient): Promise<Order> {
    const prisma = this.getPrismaClient(tx);
    const order = await this.performOrderUpdate(id, updateOrderDto, prisma);
    this.clearCachesAfterUpdate(order);
    return order;
  }

  private async performOrderUpdate(
    id: number, 
    updateOrderDto: UpdateOrderModel, 
    prisma: Prisma.TransactionClient | PrismaService
  ) {
    return await prisma.order.update({
      where: { order_id: id },
      data: { status: updateOrderDto.status },
      include: { userOrders: true }
    });
  }

  private clearCachesAfterUpdate(order: any): void {
    this.clearAllOrdersCache();
    this.clearOrderCache(order.userOrders[0].user_uuid);
    this.clearCachedOrderById(order.order_id);
  }

  async saveOrderItems(
    cartResponseModel: CartResponseModel, 
    orderId: number, 
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    const prisma = this.getPrismaClient(tx);
    await Promise.all(
      cartResponseModel.details.map((detail) => 
        this.createOrderItem(detail, orderId, prisma)
      )
    );
  }

  private async createOrderItem(detail: any, orderId: number, prisma: Prisma.TransactionClient | PrismaService) {
    return await prisma.orderItem.create({
      data: this.buildOrderItemData(detail, orderId),
    });
  }

  private buildOrderItemData(detail: any, orderId: number) {
    return {
      order: { connect: { order_id: orderId } },
      product: { connect: { product_id: detail.product.product_id } },
      product_name: detail.product.product_name,
      unit_price: detail.product.price,
      quantity: detail.quantity,
      total: detail.total,
    };
  }

  remove(id: number): string {
    return `This action removes a #${id} order`;
  }

  // ==================== Private Helper Methods ====================

  private getPrismaClient(tx?: Prisma.TransactionClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  private getOrderIncludes(): Prisma.OrderInclude {
    return {
      userOrders: {
        include: { user: true }
      },
      cart: {
        include: {
          cartDetails: {
            include: { product: true }
          }
        }
      }
    };
  }
}
