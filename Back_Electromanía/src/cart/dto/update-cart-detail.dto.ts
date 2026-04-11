import { IsInt, IsNotEmpty, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateCartDetailDto {
  @IsNotEmpty({ message: 'El ID del producto no puede estar vacío' })
  @IsInt({ message: 'El ID del producto debe ser un número entero' })
  @IsPositive({ message: 'El ID del producto debe ser positivo' })
  @Type(() => Number)
  @ApiProperty({
    description: 'ID del producto',
    example: 1,
    type: Number,
  })
  productId: number;

  @IsNotEmpty({ message: 'La cantidad no puede estar vacía' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  @Type(() => Number)
  @ApiProperty({
    description: 'Cantidad del producto a agregar',
    example: 4,
    type: Number,
  })
  quantity: number;
}
