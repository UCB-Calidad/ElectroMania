import { Injectable } from '@nestjs/common';
import { CartService } from '../service/cart.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CreateCartUseCase {
  constructor(
    private readonly cartService: CartService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(userUuid: string) {
    return await this.cartService.createCart(userUuid);
  }
}
