import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { PrismaService } from '../../prisma/service/prisma.service';
import { CategoryMapper } from '../mapper/category.mapper';
import { Prisma } from '@prisma/client';
import { RegisterProductCategoryDto } from '../dto/register-product-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoryMapper: CategoryMapper,
  ) {}

  async create(category: Prisma.CategoryCreateInput) {
    return await this.prisma.category.create({ data: category });
  }

  async registerCategoryToProduct(
    registerProductCategory: RegisterProductCategoryDto,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    const category = await prisma.category.findUnique({
      where: { category_id: registerProductCategory.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return await this.update(
      registerProductCategory.categoryId,
      this.categoryMapper.toAddProduct(registerProductCategory),
      prisma,
    );
  }
  async update(
    id: number,
    category: Prisma.CategoryUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    return await prisma.category.update({
      where: { category_id: id },
      data: category,
    });
  }

  async register(category: CreateCategoryDto) {
    return await this.create(this.categoryMapper.toEntity(category));
  }

  async findAll() {
    try {
      const categories = await this.prisma.category.findMany();
      if (categories.length === 0) {
        throw new NotFoundException(' Categories not found');
      }
      return categories.map((c) => this.categoryMapper.toModel(c));
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e;
      }
      throw new NotFoundException(' Categories not found');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
