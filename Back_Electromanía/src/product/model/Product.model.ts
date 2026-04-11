import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ProductModel {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    title: 'product_id',
    description: 'Numero de identificacion del producto',
    example: 1,
    type: Number,
    required: true,
  })
  product_id: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    title: 'product_name',
    description: 'Nombre del producto',
    example: 'Producto 1',
    type: String,
    required: true,
  })
  product_name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    title: 'description',
    description: 'Descripcion del producto',
    example: 'Este Producto es lo que buscas',
    type: String,
    required: true,
  })
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    title: 'price',
    description: 'Precio del producto',
    example: 100,
    type: Number,
    required: true,
  })
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    title: 'stock',
    description: 'Stock del producto',
    example: 10,
    type: Number,
    required: true,
  })
  stock: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    title: 'state',
    description: 'Estado del producto',
    example: 'AVAILABLE',
    type: String,
    required: true,
    enum: ['AVAILABLE', 'UNAVAILABLE', 'OUT_OF_STOCK'],
  })
  state: string;
}

export class ProductWithImagesModel extends ProductModel {
  @IsNotEmpty()
  @IsArray()
  @ApiProperty({
    title: 'images',
    description: 'Imagenes del producto',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    type: [String],
    required: true,
    isArray: true,
  })
  images: string[];
}

export class ProductWithCategoriesModel extends ProductModel {
  @IsNotEmpty()
  @IsArray()
  @ApiProperty({
    title: 'categories',
    description: 'Categorias del producto',
    example: ['Electronics', 'Clothing'],
    type: [String],
    required: true,
    isArray: true,
  })
  categories: string[];
}

export class ProductWithCategoriesAndImagesModel extends ProductWithCategoriesModel {
  @IsNotEmpty()
  @IsArray()
  @ApiProperty({
    title: 'images',
    description: 'Imagenes del producto',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    type: [String],
    required: true,
    isArray: true,
  })
  images: string[];
}
