import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderService } from './order.service';
import { PrismaService } from '../../prisma/service/prisma.service';
import { prismaMock } from '../../../test-utils/prisma-mock';
import { OrderResponseModel } from '../models/order-response.model';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import { OrderMapper } from '../mapper/order.mapper';
describe('OrderService', () => {
  let orderService: OrderService;
  let orderMapperMock: DeepMockProxy<OrderMapper>;;
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
});
