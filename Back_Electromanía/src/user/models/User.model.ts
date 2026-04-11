import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class UserModel {
  @IsString()
  @ApiProperty({
    title: 'uuid',
    description: 'Identificador unico del usuario',
    type: String,
  })
  uuid: string;

  @IsString()
  @ApiProperty({
    title: 'name',
    description: 'Nombre del usuario',
    type: String,
  })
  name: string;

  @IsString()
  @IsEmail({
    ignore_max_length: true,
    allow_utf8_local_part: true,
  })
  @ApiProperty({
    title: 'email',
    description: 'Correo electronico del usuario',
    type: String,
  })
  email: string;

  @IsString()
  @ApiProperty({
    title: 'nit_ci',
    description: 'Nit o CI del usuario',
    type: String,
  })
  nit_ci: string;

  @IsString()
  @ApiProperty({
    title: 'social_reason',
    description: 'Razon social del usuario',
    type: String,
  })
  social_reason: string;

  @IsString()
  @ApiProperty({
    title: 'role',
    description: 'Rol del usuario',
    type: String,
    enum: ['ADMIN', 'USER'],
  })
  role: string;
  @ApiProperty({
    title: 'Telefono',
    description: 'Telefono del usuario',
    type: String,
  })
  phone: string;
}
