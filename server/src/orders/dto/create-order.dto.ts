// server/src/orders/dto/create-order.dto.ts
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 'Azizbek' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  customerName: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  customerPhone: string;

  @ApiProperty({ example: 'Tashkent, Chilonzor' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  customerAddress: string;

  @ApiProperty({ example: 1999 })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({ example: 'cash' })
  @IsString()
  @IsIn(['cash', 'card'])
  paymentMethod: string;

  @ApiProperty({ example: [{ id: 1, name: 'iPhone 15 Pro', quantity: 1 }] })
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  items: any;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  userId?: number;
}
