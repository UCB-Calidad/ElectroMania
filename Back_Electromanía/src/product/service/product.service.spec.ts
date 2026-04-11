import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../../prisma/service/prisma.service';
import { ProductMapper } from '../mapper/Product.mapper';
import { ProductImageMapper } from '../mapper/ProductImage.mapper';
import { PageProductMapper } from '../mapper/PageProduct.mapper';
import { CreateProductRequestModel } from '../model/CreateProductRequest.model';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { vi } from 'vitest';

describe('ProductService (unit)', () => {
  let service: ProductService;
  let prismaMock: any;

  const mockProductEntity = {
    product_id: 1,
    product_name: 'prueba',
    description: 'prueba',
    price: 100,
    stock_total: 25,
    stock_reserved: 15,
    state: true,
    productImages: [],
    productCategories: [],
  };

  beforeEach(async () => {
    // Mock completo de PrismaService
    prismaMock = {
      product: {
        create: vi.fn().mockResolvedValue(mockProductEntity),
        findMany: vi.fn().mockResolvedValue([mockProductEntity]),
        findUnique: vi.fn().mockResolvedValue(mockProductEntity),
        update: vi.fn().mockResolvedValue(mockProductEntity),
        delete: vi.fn().mockResolvedValue(mockProductEntity),
        reserveStock: vi.fn().mockResolvedValue(mockProductEntity),
      },
      productImage: {
        create: vi.fn().mockResolvedValue({}),
        deleteMany: vi.fn().mockResolvedValue({}),
      },
      $transaction: vi.fn().mockImplementation(async (fn) => fn(prismaMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        ProductMapper,
        ProductImageMapper,
        PageProductMapper,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: vi.fn(),
            set: vi.fn(),
            del: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a product', async () => {
    const dto: CreateProductRequestModel = {
      product_name: 'prueba',
      description: 'prueba',
      price: 100,
      stock: 10,
    };
    const result = await service.createProduct(dto);
    expect(result.product_id).toBe(1);
    expect(prismaMock.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.any(Object),
        include: expect.any(Object),
      }),
    );
  });

  it('should get all products', async () => {
    const result = await service.getAllProducts();
    expect(result).toHaveLength(1);
    expect(result[0].product_name).toBe('prueba');
  });

  it('should throw NotFoundException if getAllProducts returns empty', async () => {
    prismaMock.product.findMany.mockResolvedValueOnce([]);
    await expect(service.getAllProducts()).rejects.toThrow(NotFoundException);
  });

  it('should update a product', async () => {
    const updateDto: Partial<CreateProductRequestModel> = { price: 200 };
    const result = await service.updateProduct(1, updateDto);
    expect(result.product_id).toBe(1);
    expect(prismaMock.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { product_id: 1 },
        data: expect.any(Object),
        include: expect.any(Object),
      }),
    );
  });

  it('should delete a product', async () => {
    await service.deleteProduct(1);
    expect(prismaMock.product.delete).toHaveBeenCalledWith({
      where: { product_id: 1 },
    });
    expect(prismaMock.productImage.deleteMany).toHaveBeenCalledWith({
      where: { product_id: 1 },
    });
  });

  it('should get product by id', async () => {
    const result = await service.getProductById(1);
    expect(result.product_id).toBe(1);
    expect(prismaMock.product.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { product_id: 1 },
        include: expect.any(Object),
      }),
    );
  });

  it('should check stock', async () => {
    prismaMock.product.findUnique.mockResolvedValueOnce({
      stock_reserved: 10,
      stock_total: 15,
    });
    const hasStock = await service.checkStock(1, 5);
    expect(hasStock).toBe(true);
    prismaMock.product.findUnique.mockResolvedValueOnce({
      stock_reserved: 2,
      stock_total: 10,
    });
    const lowStock = await service.checkStock(1, 1);
    expect(lowStock).toBe(true);
  });

  it('should add stock', async () => {
    await service.addStock(1, 5);
    expect(prismaMock.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { product_id: 1 },
        data: { stock_total: { increment: 5 } },
      }),
    );
  });

  it('should confirm sale and discount stock', async () => {
    await service.confirmSale(1, 5);
    expect(prismaMock.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { product_id: 1 },
        data: {
          stock_total: { decrement: 5 },
          stock_reserved: { decrement: 5 },
        },
      }),
    );
  });

  it('should throw ForbiddenException if reserved stock is insufficient', async () => {
    prismaMock.product.findUnique.mockResolvedValueOnce({ stock_reserved: 2 });
    await expect(service.confirmSale(1, 5)).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException if product not found for confirmSale', async () => {
    prismaMock.product.findUnique.mockResolvedValueOnce(null);
    await expect(service.confirmSale(1, 1)).rejects.toThrow(NotFoundException);
  });
});
