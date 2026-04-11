import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Delete,
  Put,
  UploadedFile,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from '../service/product.service';
import { CreateProductRequestModel } from '../model/CreateProductRequest.model';
import { RegisterProductImageRequestModel } from '../model/RegisterProductImageRequest.model';
import { PageProductResponseModel } from '../model/PageProductResponse.model';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../user/enums/UserRole.enum';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductModel } from '../model/Product.model';
import { productMulterConfig } from '../../common/utils/multer/product-multer.config';
import { RegisterProductUseCase } from '../use-cases/register-product.use-case';

@Controller('products')
@ApiTags('Products')
export class ProductController {
  private readonly logger = new Logger(ProductController.name);
  constructor(
    private readonly productService: ProductService,
    private readonly registerProductUseCase: RegisterProductUseCase,
  ) {}

  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos los productos',
    description: 'Obtiene todos los productos',
    tags: ['Products'],
  })
  @ApiResponse({
    status: 200,
    description: 'Productos obtenidos',
    type: [ProductModel],
    example: [
      {
        product_id: 1,
        product_name: 'Producto 1',
        description: 'Descripción del producto 1',
        price: 100,
        stock: 10,
        state: true,
        images: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
        ],
      },
    ],
    content: {
      'application/json': {
        example: [
          {
            product_id: 1,
            product_name: 'Producto 1',
            description: 'Descripción del producto 1',
            price: 100,
            stock: 10,
            state: true,
            images: [
              'https://example.com/image1.jpg',
              'https://example.com/image2.jpg',
            ],
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Products not found',
  })
  getAllProducts(): Promise<ProductModel[]> {
    return this.productService.getAllProducts();
  }

  @Get('')
  @ApiOperation({
    summary: 'Obtener una pagina de productos dada la pagina',
    description: 'Obtiene los productos de una pagina dada',
    tags: ['Products'],
  })
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Productos obtenidos',
    type: PageProductResponseModel,
    example: {
      page: 1,
      max_size_per_page: 20,
      content: [
        {
          product_id: 1,
          product_name: 'Producto 1',
          description: 'Descripción del producto 1',
          price: 100,
          stock: 10,
          state: true,
          images: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
          ],
        },
      ],
      totalElements: 1,
    },
    content: {
      'application/json': {
        example: {
          page: 1,
          max_size_per_page: 20,
          content: [
            {
              product_id: 1,
              product_name: 'Producto 1',
              description: 'Descripción del producto 1',
              price: 100,
              stock: 10,
              state: true,
              images: [
                'https://example.com/image1.jpg',
                'https://example.com/image2.jpg',
              ],
            },
          ],
          totalElements: 1,
        },
      },
    },
  })
  getPage(@Query('page') page: number): Promise<PageProductResponseModel> {
    return this.productService.getPageProduct(page);
  }
  @Get('by')
  getProduct(@Query('id') id: number): Promise<ProductModel> {
    return this.productService.getProductById(id);
  }
  @Roles(UserRole.ADMIN, UserRole.EMPLOYED)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Registrar un producto',
    description: 'Registra un producto',
    tags: ['Products'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/CreateProductRequestModel',
          },
          example: {
            product_name: 'Producto 1',
            description: 'Descripción del producto 1',
            price: 100,
            stock: 10,
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Producto registrado',
    type: ProductModel,
    example: {
      product_id: 1,
      product_name: 'Producto 1',
      description: 'Descripción del producto 1',
      price: 100,
      stock: 10,
      state: true,
      images: [],
    },
    content: {
      'application/json': {
        example: {
          product_id: 1,
          product_name: 'Producto 1',
          description: 'Descripción del producto 1',
          price: 100,
          stock: 10,
          state: true,
          images: [],
        },
      },
    },
  })
  @Post('register')
  @UseInterceptors(FileInterceptor('image', productMulterConfig))
  async registerProduct(
    @Body() product: CreateProductRequestModel,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<ProductModel> {
    return this.registerProductUseCase.execute(product, image);
  }
  @Roles(UserRole.ADMIN, UserRole.EMPLOYED)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('addImage')
  @ApiOperation({
    summary: 'Registrar una imagen a un producto',
    description: 'Registra una imagen a un producto',
    tags: ['Products'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/RegisterProductImageRequestModel',
          },
          example: {
            name: 'Producto 1',
            image_url: 'https://example.com/image1.jpg',
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Producto registrado',
    type: ProductModel,
    example: {
      product_id: 1,
      product_name: 'Producto 1',
      description: 'Descripción del producto 1',
      price: 100,
      stock: 10,
      state: true,
      images: ['https://example.com/image1.jpg'],
    },
  })
  registerProductImage(
    @Body() productImage: RegisterProductImageRequestModel,
  ): Promise<ProductModel> {
    return this.productService.registerProductImage(productImage);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Eliminar un producto',
    description: 'Elimina un producto',
    tags: ['Products'],
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
  })
  @ApiOkResponse({
    description: 'Producto Eliminado',
    type: Object,
    example: {
      message: 'Producto eliminado correctamente',
    },
  })
  @ApiNotFoundResponse({
    description: 'Producto no encontrado',
    type: Object,
    example: {
      message: 'Producto no encontrado',
    },
  })
  @Delete('delete/:id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    this.logger.log(`Eliminando producto con ID: ${id}`);
    await this.productService.deleteProduct(Number(id));
    return { message: 'Producto eliminado correctamente' }; // suggested message for terminal output
  }

  @Roles(UserRole.ADMIN, UserRole.EMPLOYED)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Actualizar un producto',
    description: 'Actualiza un producto',
    tags: ['Products'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/PartialCreateProductRequestModel',
          },
          example: {
            product_name: 'Producto 1',
            description: 'Descripción del producto 1 cambiada',
            price: 120,
            stock: 17,
          },
        },
      },
    },
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
  })
  @ApiBody({
    type: CreateProductRequestModel,
  })
  @ApiOkResponse({
    description: 'Producto actualizado',
    type: ProductModel,
    example: {
      product_id: 1,
      product_name: 'Producto 1',
      description: 'Descripción del producto 1 cambiada',
      price: 120,
      stock: 17,
      state: true,
      images: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'Producto no encontrado',
    type: Object,
    example: {
      message: 'Producto no encontrado',
    },
  })
  @Put('update/')
  async update(
    @Query('id') id: string,
    @Body() dto: Partial<CreateProductRequestModel>,
  ): Promise<ProductModel> {
    return this.productService.updateProduct(Number(id), dto);
  }
}
