import { IsNumber, IsArray } from 'class-validator';
import { ProductModel } from './Product.model';
import { ApiProperty } from '@nestjs/swagger';

export class PageProductResponseModel {
  @IsNumber()
  @ApiProperty({
    title: 'page',
    description: 'Numero de la pagina',
    example: 1,
    type: Number,
  })
  page: number;
  @IsNumber()
  @ApiProperty({
    title: 'max_size_per_page',
    description: 'Tamaño maximo de la pagina',
    example: 20,
    type: Number,
  })
  max_size_per_page: number;
  @IsArray()
  @ApiProperty({
    title: 'content',
    description: 'Contenido de la pagina de productos',
    type: ProductModel,
    isArray: true,
  })
  content: ProductModel[];
  @IsNumber()
  @ApiProperty({
    title: 'totalElements',
    description: 'Total de elementos de la pagina',
    example: 1,
    type: Number,
  })
  totalElements: number;
}
