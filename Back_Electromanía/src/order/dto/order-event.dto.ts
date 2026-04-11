import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { OrderStatus, OrderUserModel } from '../models/order-response.model';

export class OrderCreatedEventDto {
  @IsNumber()
  @IsNotEmpty()
  order_id: number;
  @IsNotEmpty()
  user: OrderUserModel;
  @IsNumber()
  @IsNotEmpty()
  total: number;
  @IsString()
  @IsNotEmpty()
  status: string;
  @IsString()
  @IsNotEmpty()
  createdAt: string;
}

export class OrderUpdatedEventDto {
  @IsNumber()
  @IsNotEmpty()
  order_id: number;
  @IsNotEmpty()
  user: OrderUserModel;
  @IsNumber()
  @IsNotEmpty()
  total: number;
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;

  @IsString()
  @IsOptional()
  updatedAt?: string;
}

export class OrderCancelledEventDto {
  @IsNumber()
  @IsNotEmpty()
  order_id: number;
  @IsNotEmpty()
  user: OrderUserModel;
  @IsString()
  @IsOptional()
  reason?: string;
  @IsNumber()
  @IsNotEmpty()
  total: number;
  @IsEnum(OrderStatus)
  status: OrderStatus;
  @IsString()
  @IsNotEmpty()
  cancelledAt: string;
}

export class SubscribeToOrderDto {
  @IsNumber()
  @IsNotEmpty()
  order_id: number;
}
