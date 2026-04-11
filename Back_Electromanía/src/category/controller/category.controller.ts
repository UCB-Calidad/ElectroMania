import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from '../service/category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { RegisterProductCategoryDto } from '../dto/register-product-category.dto';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../user/enums/UserRole.enum';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AuthGuard } from '../../auth/guards/auth.guard';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard, AuthGuard)
  @Post('register')
  register(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.register(createCategoryDto);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('addProduct')
  registerProductCategory(
    @Body() registerProductCategoryDto: RegisterProductCategoryDto,
  ) {
    return this.categoryService.registerCategoryToProduct(
      registerProductCategoryDto,
    );
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
