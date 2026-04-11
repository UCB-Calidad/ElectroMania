import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from '../service/cart.service';
import { AddProductToCartUseCase } from '../use-cases/add-product-to-cart.use-case';
import { UpdateProductQuantityUseCase } from '../use-cases/update-product-quantity.use-case';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { GetActiveCartUseCase } from '../use-cases/get-active-cart.use-case';
import { IncreaseQuantityUseCase } from '../use-cases/increase-quantity.use-case';
import { DecreaseQuantityUseCase } from '../use-cases/decrease-quantity.use-case';
import { RemoveProductFromCartUseCase } from '../use-cases/remove-product-from-cart-use-case';
import { AuthService } from '../../auth/service/auth.service';
import { CreateCartUseCase } from '../use-cases/create-cart.use-case';
import { vi } from 'vitest';

describe('CartController', () => {
  let controller: CartController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: {
            createCart: vi.fn(),
            getCartByUser: vi.fn(),
            deleteCartDetail: vi.fn(),
          },
        },
        {
          provide: AddProductToCartUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
        {
          provide: UpdateProductQuantityUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
        {
          provide: GetActiveCartUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
        {
          provide: IncreaseQuantityUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
        {
          provide: DecreaseQuantityUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
        {
          provide: RemoveProductFromCartUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            getUserFromToken: vi.fn(),
          },
        },
        {
          provide: CreateCartUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CartController>(CartController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
