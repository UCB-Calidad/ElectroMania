import { ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/service/prisma.service';
import { ProductMapper, ProductWithCategoriesAndImages } from '../mapper/Product.mapper';
import { ProductImageMapper } from '../mapper/ProductImage.mapper';
import { PageProductMapper } from '../mapper/PageProduct.mapper';
import { ProductModel } from '../model/Product.model';
import { CreateProductRequestModel } from '../model/CreateProductRequest.model';
import { RegisterProductImageRequestModel } from '../model/RegisterProductImageRequest.model';
import { PageProductResponseModel } from '../model/PageProductResponse.model';
import { Prisma, Product } from '@prisma/client';
import { RegisterProductCategoryDto } from '../../category/dto/register-product-category.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheProductKeys } from '../cache/cache-products.keys';

@Injectable()
export class ProductService {
  loger = new Logger(ProductService.name)
  private readonly CacheProductKeys = CacheProductKeys
  constructor(private readonly prisma: PrismaService,
    private readonly productMapper: ProductMapper,
    private readonly productImageMapper: ProductImageMapper,
    private readonly pageProductMapper: PageProductMapper,
    @Inject(CACHE_MANAGER) private readonly cacheManager:Cache
  ) {}

  async createProduct(dto: CreateProductRequestModel, tx?: Prisma.TransactionClient): Promise<ProductModel> {
    const product = await this.insertProduct(dto);
    return this.productMapper.toModelWithCategoryAndImages(product);
  }

  private async insertProduct(dto: CreateProductRequestModel): Promise<ProductWithCategoriesAndImages> {
    const data = this.productMapper.toEntity(dto);
    return await this.prisma.product.create({
      data,
      include: this.getProductIncludes()
    });
  }

  async registerProductImage(
    dto: RegisterProductImageRequestModel, tx?: Prisma.TransactionClient
  ): Promise<ProductModel> {
    const prisma = this.getPrismaClient(tx);
    const product = await this.findProductByName(dto.name, prisma);
    await this.createProductImage(dto, product, prisma);
    return await this.getProductById(product.product_id, tx);
  }

  private async findProductByName(productName: string, prisma: Prisma.TransactionClient | PrismaService) {
    const product = await prisma.product.findUnique({
      where: { product_name: productName },
      include: { productImages: true },
    });

    if (!product) {
      throw new NotFoundException(`Product '${productName}' not found`);
    }

    return product;
  }

  private async createProductImage(
    dto: RegisterProductImageRequestModel, 
    product: any,
    prisma: Prisma.TransactionClient | PrismaService
  ): Promise<void> {
    const imageData = this.productImageMapper.toEntity(dto, product);
    await prisma.productImage.create({ data: imageData });
  }

  async getAllProducts(): Promise<ProductModel[]> {
    const cachedProducts = await this.getCachedProducts();
    if (cachedProducts) return cachedProducts;
    const products = await this.fetchAllProducts();
    this.validateProductsExist(products);
    const models = this.mapProductsToModels(products);
    await this.cacheProducts(models);
    return models;
  }

  private async getCachedProducts(): Promise<ProductModel[] | null> {
    const cachedProducts = await this.cacheManager.get(this.CacheProductKeys.allProducts);
    return cachedProducts ? (cachedProducts as ProductModel[]) : null;
  }

  private async fetchAllProducts(): Promise<ProductWithCategoriesAndImages[]> {
    return await this.prisma.product.findMany({
      include: this.getProductIncludes(),
      orderBy: { product_id: 'asc' }
    });
  }

  private validateProductsExist(products: any[]): void {
    if (products.length === 0) {
      throw new NotFoundException('No products found');
    }
  }

  private mapProductsToModels(products: ProductWithCategoriesAndImages[]): ProductModel[] {
    return products.map((p) => this.productMapper.toModelWithCategoryAndImages(p));
  }

  private async cacheProducts(products: ProductModel[]): Promise<void> {
    await this.cacheManager.set(this.CacheProductKeys.allProducts, products, 500);
  }

  async getPageProduct(page: number, filter?: any): Promise<PageProductResponseModel> {
    const pagination = this.calculatePagination(page);
    const products = await this.getPageProductsByFilter(filter, pagination.skip, pagination.take);
    return this.pageProductMapper.toResponse(page, products);
  }

  private calculatePagination(page: number): { skip: number; take: number } {
    const take = 20;
    const skip = (page - 1) * take;
    return { skip, take };
  }


  private async getPageProductsByFilter(filter: any, skip?: number, take?: number): Promise<ProductModel[]> {
    const cachedProducts = await this.getCachedPageProducts();
    const products = cachedProducts || await this.fetchPageProducts(filter, skip, take);
    
    await this.cachePageProducts(products);
    return this.mapProductsToModels(products);
  }

  private async getCachedPageProducts(): Promise<ProductWithCategoriesAndImages[] | null> {
    const cachedProducts = await this.cacheManager.get(this.CacheProductKeys.pageProducts);
    return cachedProducts ? (cachedProducts as ProductWithCategoriesAndImages[]) : null;
  }

  private async fetchPageProducts(
    filter: any, 
    skip?: number, 
    take?: number
  ): Promise<ProductWithCategoriesAndImages[]> {
    return await this.prisma.product.findMany({
      where: filter,
      skip,
      take,
      include: this.getProductIncludes(),
    });
  }

  private async cachePageProducts(products: ProductWithCategoriesAndImages[]): Promise<void> {
    await this.cacheManager.set(this.CacheProductKeys.pageProducts, products, 500);
  }


  async getFilterBy(filter: Prisma.ProductWhereInput): Promise<ProductModel[]> {
    const products = await this.fetchProductsByFilter(filter);
    return this.mapProductsToModels(products);
  }

  private async fetchProductsByFilter(filter: Prisma.ProductWhereInput): Promise<ProductWithCategoriesAndImages[]> {
    return await this.prisma.product.findMany({
      where: filter,
      include: this.getProductIncludes(),
    });
  }

  async updateProduct(
    productId: number,
    dto: Partial<CreateProductRequestModel>,
  ): Promise<ProductModel> {
    const updated = await this.updateProductData(productId, dto);
    this.deleteAllProductCache();
    return this.productMapper.toModelWithCategoryAndImages(updated);
  }

  private async updateProductData(
    productId: number, 
    dto: Partial<CreateProductRequestModel>
  ): Promise<ProductWithCategoriesAndImages> {
    return await this.prisma.product.update({
      where: { product_id: productId },
      data: this.productMapper.toUpdateEntity(dto),
      include: this.getProductIncludes(),
    });
  }

  async deleteProduct(productId: number): Promise<void> {
    await this.ensureProductExists(productId);
    await this.deleteProductImages(productId);
    await this.deleteProductRecord(productId);
    this.deleteAllProductCache();
  }

  private async ensureProductExists(productId: number): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { product_id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
  }

  private async deleteProductImages(productId: number): Promise<void> {
    await this.prisma.productImage.deleteMany({
      where: { product_id: productId },
    });
  }

  private async deleteProductRecord(productId: number): Promise<void> {
    await this.prisma.product.delete({
      where: { product_id: productId },
    });
  }
  private deleteAllProductCache(): void {
    this.cacheManager.del(this.CacheProductKeys.allProducts);
    this.cacheManager.del(this.CacheProductKeys.pageProducts);
  }
  async getProductById(productId: number, tx?: Prisma.TransactionClient): Promise<ProductModel> {
    const product = await this.findProductById(productId, tx);
    return this.productMapper.toModelWithCategoryAndImages(product);
  }

  private async findProductById(
    productId: number, 
    tx?: Prisma.TransactionClient
  ): Promise<ProductWithCategoriesAndImages> {
    const prisma = this.getPrismaClient(tx);
    const product = await prisma.product.findUnique({
      where: { product_id: productId },
      include: this.getProductIncludes(),
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    return product;
  }

  private getProductIncludes() {
    return {
      productImages: true,
      productCategories: {
        include: {
          category: true
        }
      }
    };
  }
  async checkStock(productId: number, quantity: number, tx?: Prisma.TransactionClient): Promise<boolean> {
    const product = await this.getProductStockInfo(productId, tx);
    return this.hasAvailableStock(product, quantity);
  }

  private hasAvailableStock(product: { stock_total: number; stock_reserved: number }, quantity: number): boolean {
    const availableStock = this.calculateAvailableStock(product);
    return availableStock >= quantity;
  }
  async addStock(productId: number, quantity: number, tx?: Prisma.TransactionClient): Promise<Product> {
    this.validateQuantity(quantity);
    const product = await this.incrementTotalStock(productId, quantity, tx);
    this.deleteAllProductCache();
    return product;
  }

  private async incrementTotalStock(
    productId: number, 
    quantity: number, 
    tx?: Prisma.TransactionClient
  ): Promise<Product> {
    const prisma = this.getPrismaClient(tx);
    return await prisma.product.update({
      where: { product_id: productId },
      data: { stock_total: { increment: quantity } },
    });
  }

  async reserveStock(productId: number, quantity: number, tx?: Prisma.TransactionClient): Promise<Product> {
    this.validateQuantity(quantity);
    await this.ensureSufficientStock(productId, quantity, tx);
    const product = await this.incrementReservedStock(productId, quantity, tx);
    this.deleteAllProductCache();
    return product;
  }

  private async incrementReservedStock(
    productId: number, 
    quantity: number, 
    tx?: Prisma.TransactionClient
  ): Promise<Product> {
    const prisma = this.getPrismaClient(tx);
    return await prisma.product.update({
      where: { product_id: productId },
      data: { stock_reserved: { increment: quantity } },
    });
  }

  async releaseReservedStock(productId: number, quantity: number, tx?: Prisma.TransactionClient): Promise<Product> {
    this.validateQuantity(quantity);
    return await this.decrementReservedStock(productId, quantity, tx);
  }

  private async decrementReservedStock(
    productId: number, 
    quantity: number, 
    tx?: Prisma.TransactionClient
  ): Promise<Product> {
    const prisma = this.getPrismaClient(tx);
    return await prisma.product.update({
      where: { product_id: productId },
      data: { stock_reserved: { decrement: quantity } },
    });
  }

  async confirmSale(productId: number, quantity: number, tx?: Prisma.TransactionClient): Promise<Product> {
    this.validateQuantity(quantity);
    await this.ensureSufficientReservedStock(productId, quantity, tx);
    const product = await this.decrementTotalAndReservedStock(productId, quantity, tx);
    this.deleteAllProductCache();
    return product;
  }

  private async decrementTotalAndReservedStock(
    productId: number, 
    quantity: number, 
    tx?: Prisma.TransactionClient
  ): Promise<Product> {
    const prisma = this.getPrismaClient(tx);
    return await prisma.product.update({
      where: { product_id: productId },
      data: {
        stock_total: { decrement: quantity },
        stock_reserved: { decrement: quantity },
      },
    });
  }

  async recoverReservedQuantity(productId: number, quantity: number, tx?: Prisma.TransactionClient): Promise<Product> {
    return await this.addStock(productId, quantity, tx);
  }

  /**
   * @deprecated Use confirmSale instead. This method will be removed in future versions.
   */
  async discountStock(productId: number, quantity: number, tx?: Prisma.TransactionClient): Promise<Product | undefined> {
    if (this.isInvalidQuantity(quantity)) return;
    return await this.confirmSale(productId, quantity, tx);
  }

  private isInvalidQuantity(quantity: number): boolean {
    return quantity <= 0;
  }

  private getPrismaClient(tx?: Prisma.TransactionClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  private validateQuantity(quantity: number): void {
    if (quantity <= 0) {
      throw new ForbiddenException('Quantity must be greater than 0');
    }
  }

  private async getProductStockInfo(productId: number, tx?: Prisma.TransactionClient) {
    const prisma = this.getPrismaClient(tx);
    const product = await prisma.product.findUnique({
      where: { product_id: productId },
      select: { stock_total: true, stock_reserved: true },
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    
    return product;
  }

  private calculateAvailableStock(product: { stock_total: number; stock_reserved: number }): number {
    return product.stock_total - product.stock_reserved;
  }

  private async ensureSufficientStock(productId: number, quantity: number, tx?: Prisma.TransactionClient): Promise<void> {
    const product = await this.getProductStockInfo(productId, tx);
    const availableStock = this.calculateAvailableStock(product);
    
    if (availableStock < quantity) {
      this.throwInsufficientStockError(quantity, availableStock);
    }
  }

  private async ensureSufficientReservedStock(productId: number, quantity: number, tx?: Prisma.TransactionClient): Promise<void> {
    const product = await this.getProductStockInfo(productId, tx);
    
    if (product.stock_reserved < quantity) {
      this.throwInsufficientReservedStockError(quantity, product.stock_reserved);
    }
  }

  private throwInsufficientStockError(requested: number, available: number): never {
    throw new ForbiddenException(
      `Insufficient stock. Requested: ${requested}, Available: ${available}`
    );
  }

  private throwInsufficientReservedStockError(requested: number, reserved: number): never {
    throw new ForbiddenException(
      `Insufficient reserved stock. Requested: ${requested}, Reserved: ${reserved}`
    );
  }
  async assignCategory(request: RegisterProductCategoryDto, tx?: Prisma.TransactionClient): Promise<Product> {
    const prisma = this.getPrismaClient(tx);
    return await this.linkProductToCategory(prisma, request.productId, request.categoryId);
  }

  private async linkProductToCategory(
    prisma: Prisma.TransactionClient | PrismaService, 
    productId: number, 
    categoryId: number
  ): Promise<Product> {
    const existingRelation = await prisma.productCategory.findUnique({
      where: {
        product_id_category_id: {
          product_id: productId,
          category_id: categoryId,
        },
      },
    });
    if (!existingRelation) {
      await prisma.productCategory.create({
        data: {
          product_id: productId,
          category_id: categoryId,
        },
      });
    }
    const product = await prisma.product.findUnique({
      where: { product_id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    return product;
  }
}
