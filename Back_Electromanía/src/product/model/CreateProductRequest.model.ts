import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductRequestModel {
  @IsString()
  @ApiProperty({
    title: 'product_name',
    description: 'Nombre del Producto',
    type: String,
  })
  product_name: string;
  @IsString()
  @ApiProperty({
    title: 'description',
    description: 'Descripcion del Producto',
    type: String,
  })
  description: string;

  @IsNumber()
  @ApiProperty({
    title: 'price',
    description: 'Precio del Producto',
    type: Number,
  })
  @Type(() => Number)
  price: number;

  @IsNumber()
  @ApiProperty({
    title: 'stock',
    description: 'Stock del Producto',
    type: Number,
  })
  @Type(() => Number)
  stock: number;
  @IsOptional()
  @IsString()
  @ApiProperty({
    title: 'image',
    description: 'imagen',
    type: String,
  })
  image?: string;
  @IsOptional()
  @IsNumber()
  @ApiProperty({
    title: 'category',
    description: 'Categoria del Producto',
    type: Number,
  })
  category_id?: number;
}
