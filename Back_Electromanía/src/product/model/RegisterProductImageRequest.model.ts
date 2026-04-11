import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegisterProductImageRequestModel {
  @IsString()
  @ApiProperty({
    title: 'name',
    description: 'Nombre del Producto',
    type: String,
  })
  name: string;
  @IsString()
  @ApiProperty({
    title: 'image_url',
    description: 'Url de la imagen',
    type: String,
  })
  image_url: string;
}
