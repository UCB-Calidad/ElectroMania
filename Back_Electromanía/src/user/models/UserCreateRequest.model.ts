import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsStrongPassword } from 'class-validator';

export class UserCreateRequestModel {
  @IsString()
  @ApiProperty({
    title: 'name',
    description: 'Nombre del usuario',
    type: String,
  })
  name: string;

  @IsString()
  @ApiProperty({
    title: 'email',
    description: 'Correo electronico del usuario',
    type: String,
  })
  email: string;
  @IsString()
  @IsStrongPassword()
  @ApiProperty({
    title: 'password',
    description: 'Contraseña del usuario',
    type: String,
  })
  password: string;

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
    title: 'phone',
    description: 'Telefono del usuario',
    type: String,
  })
  phone: string;
}
