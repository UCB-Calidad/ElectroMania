import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../controller/product.controller';
import { ProductService } from '../service/product.service';
import { RegisterProductUseCase } from '../use-cases/register-product.use-case';
import { CreateProductRequestModel } from '../model/CreateProductRequest.model';
import { RegisterProductImageRequestModel } from '../model/RegisterProductImageRequest.model';
import { ProductWithCategoriesAndImagesModel } from '../model/Product.model';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { vi } from 'vitest';

// Mock más completo del AuthGuard
class AuthGuardMock {
  canActivate() {
    return true;
  }
}

class RolesGuardMock {
  canActivate() {
    return true;
  }
}

describe('ProductController (unit)', () => {
  let controller: ProductController;
  let productService: vi.Mocked<ProductService>;
  let registerProductUseCase: vi.Mocked<RegisterProductUseCase>;

  const mockProduct: ProductWithCategoriesAndImagesModel = {
    product_id: 1,
    product_name: 'Producto 1',
    description: 'Descripcion del producto',
    price: 100,
    stock: 10,
    state: 'AVAILABLE',
    images: [],
    categories: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            getAllProducts: vi.fn().mockResolvedValue([mockProduct]),
            getPageProduct: vi.fn().mockResolvedValue({
              page: 1,
              max_size_per_page: 20,
              content: [mockProduct],
              totalElements: 1,
            }),
            registerProductImage: vi.fn().mockResolvedValue(mockProduct),
            deleteProduct: vi.fn().mockResolvedValue(undefined),
            updateProduct: vi.fn().mockResolvedValue(mockProduct),
          },
        },
        {
          provide: RegisterProductUseCase,
          useValue: {
            execute: vi.fn().mockResolvedValue(mockProduct),
          },
        },
        {
          provide: JwtService, // Cambio aquí: usar JwtService directamente
          useValue: {
            sign: vi.fn().mockReturnValue('token'),
            decode: vi.fn().mockReturnValue({ user: { uuid: 'uuid' } }),
            verify: vi.fn().mockReturnValue({ user: { uuid: 'uuid' } }),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: vi.fn(),
            set: vi.fn(),
            del: vi.fn(),
          },
        }
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(AuthGuardMock)
      .overrideGuard(RolesGuard)
      .useClass(RolesGuardMock)
      .compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get(ProductService) as vi.Mocked<ProductService>;
    registerProductUseCase = module.get(RegisterProductUseCase) as vi.Mocked<RegisterProductUseCase>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all products', async () => {
    const products = await controller.getAllProducts();
    expect(products).toHaveLength(1);
    expect(products[0].product_name).toBe('Producto 1');
  });

  it('should return a page of products', async () => {
    const page = await controller.getPage(1);
    expect(page.content).toHaveLength(1);
    expect(page.content[0].product_id).toBe(mockProduct.product_id);
  });

  it('should register a product', async () => {
    const result = await controller.registerProduct(
      { product_name: 'Producto 1', description: '', price: 100, stock: 10 } as CreateProductRequestModel,
      {} as Express.Multer.File,
    );
    expect(result.product_id).toBe(1);
    expect(registerProductUseCase.execute).toHaveBeenCalled();
  });

  it('should register a product image', async () => {
    const result = await controller.registerProductImage({
      name: 'Producto 1',
      image_url: 'https://example.com/image1.jpg',
    } as RegisterProductImageRequestModel);
    expect(result.product_id).toBe(1);
    expect(productService.registerProductImage).toHaveBeenCalled();
  });

  it('should delete a product', async () => {
    const result = await controller.delete('1');
    expect(result.message).toBe('Producto eliminado correctamente');
    expect(productService.deleteProduct).toHaveBeenCalledWith(1);
  });

  it('should update a product', async () => {
    const dto: Partial<CreateProductRequestModel> = { price: 120 };
    const result = await controller.update('1', dto);
    expect(result.product_id).toBe(1);
    expect(productService.updateProduct).toHaveBeenCalledWith(1, dto);
  });
});