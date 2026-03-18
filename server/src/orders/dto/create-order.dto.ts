// server/src/orders/dto/create-order.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsArray, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 'Azizbek' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiProperty({ example: 'Tashkent, Chilonzor' })
  @IsString()
  @IsNotEmpty()
  customerAddress: string;

  @ApiProperty({ example: 1999 })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ example: 'cash' })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ example: [{ id: 1, name: 'iPhone 15 Pro', quantity: 1 }] })
  @IsArray()
  @IsNotEmpty()
  items: any;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  userId?: number;
}
