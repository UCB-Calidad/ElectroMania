import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaService } from '../../prisma/service/prisma.service';
import { ProductService } from '../../product/service/product.service';
import { UserService } from '../../user/service/user.service';
import { AuthService } from '../../auth/service/auth.service';
import { CartMapper } from '../mapper/cart.mapper';
import { vi } from 'vitest';

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        CartMapper,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: ProductService,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: AuthService,
          useValue: {
            getUserFromToken: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
