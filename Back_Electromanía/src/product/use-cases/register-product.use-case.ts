import { Inject, Injectable, Logger } from "@nestjs/common";
import { ProductService } from "../service/product.service";
import { ImageStorage } from '../../common/utils/storage/image-storage.interface';
import { CreateProductRequestModel } from "../model/CreateProductRequest.model";
import { PrismaService } from '../../prisma/service/prisma.service';
import { RegisterProductImageRequestModel } from "../model/RegisterProductImageRequest.model";
import { RegisterProductCategoryDto } from '../../category/dto/register-product-category.dto';



@Injectable()
export class RegisterProductUseCase{
  logger = new Logger(RegisterProductUseCase.name);
  constructor(
    private readonly productService:ProductService,
    private readonly prisma:PrismaService,
    @Inject('ImageStorage')
    private readonly imageStorage:ImageStorage
  ){}
  async execute(request:CreateProductRequestModel, image?: Express.Multer.File){
    return this.prisma.$transaction(async (tx) => {
      const product = await this.productService.createProduct(request,tx)
      if(image){
        const url = await this.imageStorage.upload(image)
        const imageRequest:RegisterProductImageRequestModel = {
          name: product.product_name,
          image_url: url
        }
        await this.productService.registerProductImage(imageRequest,tx)
      }
      if(request.category_id){
        const categoryRequest: RegisterProductCategoryDto = {
          productId: product.product_id,
          categoryId: request.category_id
        }
        this.logger.log(`Assigning category ${request.category_id} to product ${product.product_id}`);
        await this.productService.assignCategory(categoryRequest,tx)
      }
      return await this.productService.getProductById(product.product_id,tx)
    }).catch((error) => {
      this.logger.error(`Error registering product: ${error.message}`, error.stack);
      throw error;
    });
  }
}