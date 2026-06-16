import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CartService } from './cart.service';
import { PrismaService } from '../../prisma/service/prisma.service';
import { ProductService } from '../../product/service/product.service';
import { UserService } from '../../user/service/user.service';
import { AuthService } from '../../auth/service/auth.service';
import { CartMapper } from '../mapper/cart.mapper';
import { CartState } from '../enums/CartState.enum';
import { NotFoundException } from '@nestjs/common';

describe('CartService', () => {
  let service: CartService;
  let mockPrismaService: any;
  let mockProductService: any;
  let mockUserService: any;
  let mockAuthService: any;
  let mockCartMapper: any;

  beforeEach(async () => {
    mockPrismaService = {
      cart: {
        create: vi.fn().mockResolvedValue({ cart_id: 1, user_uuid: "123", state: "ACTIVE", cartDetails: [] }),
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn().mockResolvedValue({ cart_id: 1 }),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
      },
      cartDetails: {
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        findUnique: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue({ id: 1, quantity: 2, cart_id: 1 }),
        delete: vi.fn().mockResolvedValue({}),
      }
    };
    mockProductService = {
      getProductById: vi.fn().mockResolvedValue({ product_id: 1, name: "Test", price: 100 }),
    };
    mockUserService = {};
    mockAuthService = {
      getUserFromToken: vi.fn().mockResolvedValue({ uuid: "123" }),
    };
    mockCartMapper = {
      toModel: vi.fn().mockReturnValue({ id: 1, userUUID: "123", details: [], total: 0 }),
      toOrderModel: vi.fn().mockReturnValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: CartMapper, useValue: mockCartMapper },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ProductService, useValue: mockProductService },
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCart', () => {
    it('Deberia crear un carrito para el usuario', async () => {
      const result = await service.createCart("123");
      expect(result).toBeDefined();
      expect(mockCartMapper.toModel).toHaveBeenCalled();
    });
  });

  describe('getActiveCartByUser', () => {
    it('Deberia crear un nuevo carrito si no existe uno activo', async () => {
      mockPrismaService.cart.findFirst.mockResolvedValue(null);
      const result = await service.getActiveCartByUser("123");
      expect(result).toBeDefined();
    });

    it('Deberia retornar el carrito activo si existe', async () => {
      const activeCart = { cart_id: 1, user_uuid: "123", state: CartState.ACTIVE, cartDetails: [] };
      mockPrismaService.cart.findFirst.mockResolvedValue(activeCart);
      const result = await service.getActiveCartByUser("123");
      expect(result).toBeDefined();
    });
  });

  describe('getCartDetailById', () => {
    it('Deberia obtener un detalle de carrito por id', async () => {
      const cartDetail = { id: 1, quantity: 2, product: { product_id: 1 } };
      mockPrismaService.cartDetails.findUnique.mockResolvedValue(cartDetail);
      const result = await service.getCartDetailById(1);
      expect(result).toBeDefined();
    });
  });

  describe('getCartDetailByCartAndProduct', () => {
    it('Deberia obtener un detalle de carrito por cart y product', async () => {
      const cartDetail = { id: 1, quantity: 2 };
      mockPrismaService.cartDetails.findFirst.mockResolvedValue(cartDetail);
      const result = await service.getCartDetailByCartAndProduct(1, 1);
      expect(result).toBeDefined();
    });
  });

  describe('increaseQuantity', () => {
    it('Deberia incrementar la cantidad de un detalle de carrito', async () => {
      mockPrismaService.cartDetails.update.mockResolvedValue({});
      mockPrismaService.cart.update.mockResolvedValue({});
      const result = await service.increaseQuantity(1, { quantity: 1 } as any);
      expect(result).toBeDefined();
    });
  });

  describe('decreaseQuantity', () => {
    it('Deberia decrementar la cantidad de un detalle de carrito', async () => {
      mockPrismaService.cartDetails.update.mockResolvedValue({});
      mockPrismaService.cart.update.mockResolvedValue({});
      const result = await service.decreaseQuantity(1, { quantity: 1 } as any);
      expect(result).toBeDefined();
    });
  });

  describe('createCartDetail', () => {
    it('Deberia crear un detalle de carrito', async () => {
      mockPrismaService.cartDetails.create.mockResolvedValue({ id: 1, quantity: 2 });
      mockPrismaService.cart.update.mockResolvedValue({});
      const result = await service.createCartDetail(1, { productId: 1, quantity: 2 } as any);
      expect(result).toBeDefined();
    });
  });

  describe('updateCartDetail', () => {
    it('Deberia actualizar un detalle de carrito', async () => {
      mockPrismaService.cartDetails.update.mockResolvedValue({ cart_id: 1 });
      mockPrismaService.cart.update.mockResolvedValue({});
      const result = await service.updateCartDetail(1, { quantity: { set: 5 } });
      expect(result).toBeDefined();
    });
  });

  describe('deleteCartDetailById', () => {
    it('Deberia eliminar un detalle de carrito', async () => {
      mockPrismaService.cartDetails.findUnique.mockResolvedValue({ id: 1, cart_id: 1 });
      mockPrismaService.cartDetails.delete.mockResolvedValue({});
      mockPrismaService.cart.update.mockResolvedValue({});
      const result = await service.deleteCartDetailById(1);
      expect(result).toBeDefined();
    });

    it('Deberia throw NotFoundException si el detalle no existe', async () => {
      mockPrismaService.cartDetails.findUnique.mockResolvedValue(null);
      await expect(service.deleteCartDetailById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCart', () => {
    it('Deberia actualizar un carrito', async () => {
      mockPrismaService.cart.update.mockResolvedValue({});
      const result = await service.updateCart(1, { state: "ACTIVE" } as any);
      expect(result).toBeDefined();
    });
  });
});