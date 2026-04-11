import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/service/prisma.service';
import { ProductService } from '../../product/service/product.service';
import { UserService } from '../../user/service/user.service';
import { CartMapper } from '../mapper/cart.mapper';
import { AuthService } from '../../auth/service/auth.service';
import { AddProductToCartRequestDto } from '../dto/addProductToCartRequest.dto';
import { Prisma, Cart, CartDetails } from '@prisma/client';
import { CartUpdateRequest } from '../models/CartUpdateRequest.model';
import { UpdateCartDetailDto } from '../dto/update-cart-detail.dto';
import { CartState } from '../enums/CartState.enum';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly cartMapper: CartMapper,
  ) {}

  // ==================== Public Methods ====================

  async createCart(uuid: string, tx?: Prisma.TransactionClient) {
    const cart = await this.insertCart(uuid, tx);
    return this.cartMapper.toModel(cart as any);
  }

  private async insertCart(uuid: string, tx?: Prisma.TransactionClient) {
    const prisma = this.getPrismaClient(tx);
    return await prisma.cart.create({
      data: this.buildCartData(uuid),
      include: this.getCartIncludes(),
    });
  }

  private buildCartData(uuid: string): Prisma.CartCreateInput {
    return {
      user: {
        connect: { uuid },
      },
      created_at: new Date(),
    };
  }
  async getCartDetailById(id: number, tx?: Prisma.TransactionClient) {
    const prisma = this.getPrismaClient(tx);
    return await this.findCartDetailById(id, prisma);
  }

  private async findCartDetailById(
    id: number,
    prisma: Prisma.TransactionClient | PrismaService,
  ) {
    return await prisma.cartDetails.findUnique({
      where: { id },
      include: this.getCartDetailIncludes(),
    });
  }
  async getActiveCartByUser(uuid: string, tx?: Prisma.TransactionClient) {
    const prisma = this.getPrismaClient(tx);
    const cart = await this.findActiveCart(uuid, prisma);

    if (!cart) {
      return await this.createCart(uuid, tx);
    }

    return this.cartMapper.toModel(cart as any);
  }

  private async findActiveCart(
    uuid: string,
    prisma: Prisma.TransactionClient | PrismaService,
  ) {
    return await prisma.cart.findFirst({
      where: this.buildActiveCartFilter(uuid),
      include: this.getCartIncludes(),
    });
  }

  private buildActiveCartFilter(uuid: string): Prisma.CartWhereInput {
    return {
      user: { uuid },
      state: CartState.ACTIVE,
    };
  }
  async getCartDetailByCartAndProduct(
    cart_id: number,
    product_id: number,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = this.getPrismaClient(tx);
    return await this.findCartDetailByCartAndProduct(
      cart_id,
      product_id,
      prisma,
    );
  }

  private async findCartDetailByCartAndProduct(
    cartId: number,
    productId: number,
    prisma: Prisma.TransactionClient | PrismaService,
  ) {
    return await prisma.cartDetails.findFirst({
      where: { cart_id: cartId, product_id: productId },
      include: this.getCartDetailIncludes(),
    });
  }
  async increaseQuantity(
    cartDetail_id: number,
    request: UpdateCartDetailDto,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = this.getPrismaClient(tx);
    const incrementData = this.buildIncrementData(request.quantity);
    return await this.updateCartDetail(cartDetail_id, incrementData, prisma);
  }

  private buildIncrementData(quantity: number): Prisma.CartDetailsUpdateInput {
    return {
      quantity: { increment: quantity },
    };
  }
  async decreaseQuantity(
    cartDetail_id: number,
    request: UpdateCartDetailDto,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = this.getPrismaClient(tx);
    const decrementData = this.buildDecrementData(request.quantity);
    return await this.updateCartDetail(cartDetail_id, decrementData, prisma);
  }

  private buildDecrementData(quantity: number): Prisma.CartDetailsUpdateInput {
    return {
      quantity: { decrement: quantity },
    };
  }
  async createCartDetail(
    cart_id: number,
    addProductRequest: AddProductToCartRequestDto,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = this.getPrismaClient(tx);
    const product = await this.productService.getProductById(
      addProductRequest.productId,
    );
    const createdDetail = await this.insertCartDetail(
      cart_id,
      addProductRequest,
      product.price,
      prisma,
    );
    await this.touchCart(cart_id, prisma);
    return createdDetail;
  }

  private async insertCartDetail(
    cartId: number,
    request: AddProductToCartRequestDto,
    unitPrice: number,
    prisma: Prisma.TransactionClient | PrismaService,
  ): Promise<CartDetails> {
    const cartDetailData = this.buildCartDetailData(
      cartId,
      request.productId,
      request.quantity,
      unitPrice,
    );
    return await prisma.cartDetails.create({ data: cartDetailData });
  }

  private buildCartDetailData(
    cartId: number,
    productId: number,
    quantity: number,
    unitPrice: number,
  ): Prisma.CartDetailsCreateInput {
    return {
      quantity,
      unit_price: unitPrice,
      cart: { connect: { cart_id: cartId } },
      product: { connect: { product_id: productId } },
    };
  }

  private async touchCart(
    cartId: number,
    prisma: Prisma.TransactionClient | PrismaService,
  ): Promise<void> {
    await prisma.cart.update({
      where: { cart_id: cartId },
      data: { updated_at: new Date() },
    });
  }
  async updateCartDetail(
    cartDetailId: number,
    cartDetail: Prisma.CartDetailsUpdateInput,
    tx?: Prisma.TransactionClient,
    options?: Prisma.CartDetailsUpdateArgs,
  ) {
    const prisma = this.getPrismaClient(tx);
    const updatedCartDetail = await this.performCartDetailUpdate(
      cartDetailId,
      cartDetail,
      prisma,
      options,
    );
    await this.updateCart(
      updatedCartDetail.cart_id,
      { id: updatedCartDetail.cart_id },
      prisma,
    );
    return updatedCartDetail;
  }

  private async performCartDetailUpdate(
    cartDetailId: number,
    cartDetail: Prisma.CartDetailsUpdateInput,
    prisma: Prisma.TransactionClient | PrismaService,
    options?: Prisma.CartDetailsUpdateArgs,
  ): Promise<CartDetails> {
    return await prisma.cartDetails.update({
      where: { id: cartDetailId },
      data: cartDetail,
      ...options,
    });
  }
  async deleteCartDetailById(
    cartDetailId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = this.getPrismaClient(tx);
    const cartDetail = await this.getExistingCartDetail(cartDetailId, prisma);
    await this.updateCart(
      cartDetail.cart_id,
      { id: cartDetail.cart_id },
      prisma,
    );
    return await this.removeCartDetail(cartDetailId, prisma);
  }

  private async getExistingCartDetail(
    cartDetailId: number,
    prisma: Prisma.TransactionClient | PrismaService,
  ): Promise<CartDetails> {
    const cartDetail = await prisma.cartDetails.findUnique({
      where: { id: cartDetailId },
    });

    if (!cartDetail) {
      throw new NotFoundException('Cart detail not found');
    }

    return cartDetail;
  }

  private async removeCartDetail(
    cartDetailId: number,
    prisma: Prisma.TransactionClient | PrismaService,
  ): Promise<CartDetails> {
    return await prisma.cartDetails.delete({
      where: { id: cartDetailId },
    });
  }

  async updateCart(
    cartId: number,
    cartUpdateRequest: CartUpdateRequest,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = this.getPrismaClient(tx);
    const updateData = this.buildCartUpdateData(cartUpdateRequest);
    return await this.performCartUpdate(cartId, updateData, prisma);
  }

  private buildCartUpdateData(
    request: CartUpdateRequest,
  ): Prisma.CartUpdateInput {
    const updateData: Prisma.CartUpdateInput = {
      updated_at: new Date(),
    };

    if (request.state) {
      updateData.state = CartState[request.state];
    }

    return updateData;
  }

  private async performCartUpdate(
    cartId: number,
    updateData: Prisma.CartUpdateInput,
    prisma: Prisma.TransactionClient | PrismaService,
  ): Promise<Cart> {
    return await prisma.cart.update({
      where: { cart_id: cartId },
      data: updateData,
    });
  }

  // ==================== Private Helper Methods ====================

  private getPrismaClient(
    tx?: Prisma.TransactionClient,
  ): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  private getCartIncludes(): Prisma.CartInclude {
    return {
      cartDetails: {
        include: this.getCartDetailIncludes(),
      },
    };
  }

  private getCartDetailIncludes(): Prisma.CartDetailsInclude {
    return {
      product: {
        include: {
          productImages: true,
        },
      },
    };
  }
}
