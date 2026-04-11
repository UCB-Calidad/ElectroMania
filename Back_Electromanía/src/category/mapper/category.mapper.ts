import { Category, Prisma } from '@prisma/client';
import { CategoryModel } from '../models/category.model';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { RegisterProductCategoryDto } from '../dto/register-product-category.dto';

export class CategoryMapper {
  toModel(entity: Category): CategoryModel {
    const model = new CategoryModel();
    model.id = entity.category_id;
    model.name = entity.category_name;
    return model;
  }
  toEntity(dto: CreateCategoryDto): Prisma.CategoryCreateInput {
    return {
      category_name: dto.name,
      description: dto.description,
    };
  }
  toAddProduct(dto: RegisterProductCategoryDto): Prisma.CategoryUpdateInput {
    return {
      productCategories: {
        create: {
          product_id: dto.productId,
        },
      },
    };
  }
}
