import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderService } from './order.service';
import { PrismaService } from '../../prisma/service/prisma.service';
import { prismaMock } from '../../../test-utils/prisma-mock';
import { OrderResponseModel } from '../models/order-response.model';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import { OrderMapper } from '../mapper/order.mapper';
import { NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheOrderKeys } from '../cache/cache-orders.keys';
describe('OrderService', () => {
  let orderService: OrderService;
  let orderMapperMock: DeepMockProxy<OrderMapper>;
  let cacheManagerMock:Cache;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderService,],
    })
    .useMocker(token => {
      if (token === PrismaService) {
        return prismaMock;
      }
      if (token === "CACHE_MANAGER") {
      return { get: vi.fn(), set: vi.fn(), del: vi.fn() };
    }
      return mockDeep(token);
    }).compile();
    orderService = module.get<OrderService>(OrderService);
    orderMapperMock = module.get(OrderMapper);
    cacheManagerMock = module.get<Cache>(CACHE_MANAGER);
    vi.clearAllMocks();
  });
  const mockOrderResponse: OrderResponseModel[] = [
    {
      id: 1,
      user: { id: 101, name: 'QA Tester' } as any,
      total: 500,
      status: 'PENDING',
      createdAt: new Date('2026-04-13T10:00:00Z'),
      cart: { id: 202, items: [] } as any,
    },
  ];
  const mockDbOrders = [{ id: 1, total_amount: 500, state: 'PENDING' }];
  describe("Obtener todas las ordenes", () =>{
    it("Deberia devolver todas las ordenes ya que no estan en cache",async ()=>{
      const getCachedSpy = vi.spyOn(orderService as any, 'getAllCachedOrders').mockResolvedValue(null);
      
      const fetchSpy = vi.spyOn(orderService as any, 'fetchAllOrders').mockResolvedValue(mockDbOrders);
      const mapSpy = vi.spyOn(orderService as any, 'mapOrdersToResponse').mockReturnValue(mockOrderResponse);
      const cacheSpy = vi.spyOn(orderService as any, 'cacheAllOrders').mockResolvedValue(undefined);

      const result = await orderService.getAll();

      expect(getCachedSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(mapSpy).toHaveBeenCalledTimes(1);
      expect(cacheSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockOrderResponse)
    });
    it("Deberia devolver todas las ordenes ya que estan en cache",async ()=>{
      const getCachedSpy = vi.spyOn(orderService as any, 'getAllCachedOrders').mockResolvedValue(mockOrderResponse);
      const fetchSpy = vi.spyOn(orderService as any, 'fetchAllOrders').mockResolvedValue(mockDbOrders);
      const mapSpy = vi.spyOn(orderService as any, 'mapOrdersToResponse').mockReturnValue(mockOrderResponse);
      const cacheSpy = vi.spyOn(orderService as any, 'cacheAllOrders').mockResolvedValue(undefined);

      const result = await orderService.getAll();

      expect(getCachedSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledTimes(0);
      expect(mapSpy).toHaveBeenCalledTimes(0);
      expect(cacheSpy).toHaveBeenCalledTimes(0);
      expect(result).toEqual(mockOrderResponse)
    });
  });
  describe("Obtener una orden por id", () =>{
    it("Deberia devolver una orden por id ya que no esta en cache",async ()=>{
      const getCachedSpy = vi.spyOn(orderService as any, 'getCahedOrderById').mockResolvedValue(null);
      const fetchSpy = vi.spyOn(orderService as any, 'findOrderById').mockResolvedValue(mockDbOrders[0]);
      const cacheSpy = vi.spyOn(orderService as any, 'cacheOrderById').mockResolvedValue(undefined);

      orderMapperMock.toResponseModel.mockReturnValue(mockOrderResponse[0]);

      const result = await orderService.getById(1);

      expect(getCachedSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledExactlyOnceWith(1)
      expect(orderMapperMock.toResponseModel).toHaveBeenCalledTimes(1);
      expect(cacheSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockOrderResponse[0])
    });
    it("Deberia devolver una orden por id ya que esta en cache",async ()=>{
      const getCachedSpy = vi.spyOn(orderService as any, 'getCahedOrderById').mockResolvedValue(mockOrderResponse[0]);
      const fetchSpy = vi.spyOn(orderService as any, 'findOrderById').mockResolvedValue(mockDbOrders[0]);
      const cacheSpy = vi.spyOn(orderService as any, 'cacheOrderById').mockResolvedValue(undefined);

      orderMapperMock.toResponseModel.mockReturnValue(mockOrderResponse[0]);

      const result = await orderService.getById(1);

      expect(getCachedSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledTimes(0);
      expect(orderMapperMock.toResponseModel).toHaveBeenCalledTimes(0);
      expect(cacheSpy).toHaveBeenCalledTimes(0);
      expect(result).toEqual(mockOrderResponse[0])
    });
  });
  describe("Obtener las ordenes por usuario",()=>{
    const userUUID:string = "123e4567-e89b-12d3-a456-426614174000";
    it("Deberia obtener las ordenes de un usuario, las cuales no estan en cache", async ()=>{
      const getCachedSpy = vi.spyOn(orderService as any, 'getCachedOrdersByUser').mockResolvedValue(null);
      const fetchSpy = vi.spyOn(orderService as any, 'fetchOrdersByUser').mockResolvedValue(mockDbOrders);
      const mapSpy = vi.spyOn(orderService as any, 'mapOrdersToResponse').mockReturnValue(mockOrderResponse);
      const cacheSpy = vi.spyOn(orderService as any, 'cacheOrdersByUser').mockResolvedValue(undefined);

      const result = await orderService.getByUser(userUUID);
      expect(getCachedSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledExactlyOnceWith(userUUID)
      expect(mapSpy).toHaveBeenCalledTimes(1);
      expect(cacheSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockOrderResponse)
    });
    it("Deberia obtener las ordenes de un usuario, las cuales no estan en cache", async ()=>{
      const getCachedSpy = vi.spyOn(orderService as any, 'getCachedOrdersByUser').mockResolvedValue(mockOrderResponse);
      const fetchSpy = vi.spyOn(orderService as any, 'fetchOrdersByUser').mockResolvedValue(mockDbOrders);
      const mapSpy = vi.spyOn(orderService as any, 'mapOrdersToResponse').mockReturnValue(mockOrderResponse);
      const cacheSpy = vi.spyOn(orderService as any, 'cacheOrdersByUser').mockResolvedValue(undefined);

      const result = await orderService.getByUser(userUUID);
      expect(getCachedSpy).toHaveBeenCalledExactlyOnceWith(userUUID);
      expect(fetchSpy).toHaveBeenCalledTimes(0)
      expect(mapSpy).toHaveBeenCalledTimes(0);
      expect(cacheSpy).toHaveBeenCalledTimes(0);
      expect(result).toEqual(mockOrderResponse)
    });
  });
  describe("Obtener las ordenes de la base de datos por el id",()=>{
    const orderId: number = 3;
    const orderIncludes: any = {
      userOrders: {
        include: { user: true },
      },
      cart: {
        include: {
          cartDetails: {
            include: { product: true },
          },
        },
      },
    }
    it("Deberia obtener una exception debido a que la orden con el id no existe", async ()=>{
      prismaMock.order.findUnique.mockResolvedValue(null);
      vi.spyOn(orderService as any, 'getCahedOrderById').mockResolvedValue(null);

      await expect(orderService.getById(orderId)).rejects.toThrow(new NotFoundException(`Order with ID ${orderId} not found`));
    });
    it("Deberia obtener la orden de la base de datos", async ()=>{
      prismaMock.order.findUnique.mockResolvedValue(mockDbOrders[0] as any);
      const mockPrismaOrderFindUnique = vi.spyOn(prismaMock.order, 'findUnique').mockResolvedValue(mockDbOrders[0] as any);
      vi.spyOn(orderService as any, 'getCahedOrderById').mockResolvedValue(null);

      await orderService.getById(orderId);
      
      expect(mockPrismaOrderFindUnique).toHaveBeenCalledExactlyOnceWith({
        where: {  order_id: orderId },
        include: orderIncludes
      })
    });
  });
  describe("Obtener una orden para el recibo",()=>{
    const orderId: number = 3;
    const orderIncludes = (orderId: number) => ({
      orderItems: true,
      payment: {
        where: { order_id: orderId },
      },
      cart: {
        include: {
          user: {
            omit: { password: true },
          },
        },
      },
    });
    it("Deberia obtener una exception debido a que la orden con el id no existe", async ()=>{
      prismaMock.order.findUnique.mockResolvedValue(null);
      await expect(orderService.getOrderForXML(orderId)).rejects.toThrow(new NotFoundException(`Order with ID ${orderId} not found`));
    });
    it("Deberia obtener la orden de la base de datos y mapearla al modelo del recibo", async ()=>{
      prismaMock.order.findUnique.mockResolvedValue(mockDbOrders[0] as any);
      const mockPrismaOrderFindUnique = vi
        .spyOn(prismaMock.order, 'findUnique');
      orderMapperMock.toOrderReceiptModel.mockReturnValue({} as any);
      const mockOrderMapper = vi.spyOn(orderMapperMock, 'toOrderReceiptModel');
      await orderService.getOrderForXML(orderId);
      expect(mockPrismaOrderFindUnique).toHaveBeenCalledExactlyOnceWith({
        where: {  order_id: orderId },
        include: orderIncludes(orderId)
      });
      expect(mockOrderMapper).toHaveBeenCalledExactlyOnceWith(mockDbOrders[0] as any)
    })
  });
  describe("registrar una orden",()=>{
    it("Deberia crear una orden y mapearla al modelo de respuesta", async ()=>{
      const userUUID = "123e4567-e89b-12d3-a456-426614174000";
      const cart: any = {
        userUUID: userUUID,
        total: 1000,
        id: 1,
      };
      const mockRequestDto: any ={
        user_uuid: userUUID,
        cart: cart,
      }
      prismaMock.order.create.mockResolvedValue(mockDbOrders[0] as any);
      const mockInsertOrder = vi.spyOn(orderService as any, 'insertOrder').mockResolvedValue({} as any);
      orderMapperMock.toRegisterEntity.mockReturnValue({} as any);
      const mockOrderMapper = vi.spyOn(orderMapperMock, 'toRegisterEntity');
      orderMapperMock.toResponseModel.mockReturnValue(mockOrderResponse[0]);
      const mockToResponseModel = vi.spyOn(orderMapperMock, 'toResponseModel');
      const mockUpdateCache = vi.spyOn(orderService as any, "updateCacheAfterCreate").mockResolvedValue(undefined);


      const result = await orderService.register(userUUID, cart);


      expect(mockOrderMapper).toHaveBeenCalledTimes(1);
      expect(mockOrderMapper).toHaveBeenCalledExactlyOnceWith(mockRequestDto);
      expect(mockInsertOrder).toHaveBeenCalledTimes(1);
      expect(mockToResponseModel).toHaveBeenCalledTimes(1);
      expect(mockUpdateCache).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockOrderResponse[0])
    });
  });
  describe("Obtener Ordenes Cacheadas por Id",()=>{
    it("Deberia obtener la orden de la cache con el id",async ()=>{
      const orderId = 1;
      vi.spyOn(cacheManagerMock, 'get').mockResolvedValue(mockOrderResponse[0]);

      const result = await orderService.getById(orderId);

      expect(cacheManagerMock.get).toHaveBeenCalledExactlyOnceWith(CacheOrderKeys.orderByID(orderId));
      expect(result).toEqual(mockOrderResponse[0])
    });
    it("Deberia devolver null si no hay una orden cacheada con el id",async ()=>{
      const orderId = 1;
      vi.spyOn(cacheManagerMock, 'get').mockResolvedValue(null);
      const result = await orderService['getCahedOrderById'](orderId);

      expect(cacheManagerMock.get).toHaveBeenCalledExactlyOnceWith(CacheOrderKeys.orderByID(orderId));
      expect(result).toBeNull();
    });
  });
  describe("Insertar una orden en la base de datos",()=>{
    it("Deberia insertar una orden en la base de datos",async ()=>{
      prismaMock.order.create.mockResolvedValue(mockDbOrders[0] as any);
      const createOrderDto: any = {
        user_uuid: "123e4567-e89b-12d3-a456-426614174000",
        cart: {
          id: 1,
          total: 1000,
        },
      };
      const result = await orderService['insertOrder'](createOrderDto, prismaMock);
      expect(prismaMock.order.create).toHaveBeenCalledExactlyOnceWith({
        data: createOrderDto,
        include: orderService['getOrderIncludes'](),
      });
      expect(result).toEqual(mockDbOrders[0] as any)
    });
  });
  describe("Guardar productos de la orden",()=>{
    it("Deberia guardar los productos de la orden en la base de datos", async ()=>{
      const orderId = 1;
      const cartResponse: any = {
        id: 1,
        details: [
          {
            productId: 101,
            quantity: 2
          },
          {
            productId: 102,
            quantity: 1
          }
        ]
      };
      const mockCreateOrderItems = vi.spyOn(orderService as any, 'createOrderItem').mockResolvedValue(undefined);
      const result = await orderService.saveOrderItems(cartResponse, orderId, prismaMock);
      
      expect(mockCreateOrderItems).toHaveBeenCalledTimes(cartResponse.details.length);
      expect(mockCreateOrderItems).toHaveBeenCalledWith(cartResponse.details[0], orderId, prismaMock);
      expect(mockCreateOrderItems).toHaveBeenCalledWith(cartResponse.details[1], orderId, prismaMock);
    });
  });
  describe("Obtener todas las ordenes que estan en cache",()=>{
    it("Deberia obtener todas las ordenes que estan en cache", async ()=>{
      vi.spyOn(cacheManagerMock, 'get').mockResolvedValue(mockOrderResponse);
      const result = await orderService['getAllCachedOrders']();

      expect(cacheManagerMock.get).toHaveBeenCalledExactlyOnceWith(CacheOrderKeys.allOrders);
      expect(result).toEqual(mockOrderResponse)
    });
    it("Deberia devolver null si no hay ordenes cacheadas", async ()=>{
      vi.spyOn(cacheManagerMock, 'get').mockResolvedValue(null);
      const result = await orderService['getAllCachedOrders']();
      
      expect(cacheManagerMock.get).toHaveBeenCalledExactlyOnceWith(CacheOrderKeys.allOrders);
      expect(result).toBeNull();
    })
  });
  describe("Guardar en cache una orden por su id",()=>{
    const CACHE_TTL = 8000;
    it("Deberia guardar en cache una orden por su id", async ()=>{
      vi.spyOn(cacheManagerMock, 'set').mockResolvedValue(undefined);
      const orderId = 1;
      const orderResponse = mockOrderResponse[0];
      await orderService['cacheOrderById'](orderId, orderResponse);
      
      expect(cacheManagerMock.set).toHaveBeenCalledExactlyOnceWith(CacheOrderKeys.orderByID(orderId), orderResponse, CACHE_TTL);
    });
  });
  describe("Obtener las ordenes sin mappear de la base de datos",()=>{
    it("Deberia obtener las ordenes sin mappear de la base de datos", async ()=>{
      prismaMock.order.findMany.mockResolvedValue(mockDbOrders as any);
      const result = await orderService['fetchAllOrders']();
      
      expect(prismaMock.order.findMany).toHaveBeenCalledExactlyOnceWith({
        include: orderService['getOrderIncludes'](),
      });
      expect(result).toEqual(mockDbOrders as any);
    });
  });
});
