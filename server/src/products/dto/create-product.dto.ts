// server/src/products/dto/create-product.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsJSON } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'phones' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 999 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 1199, required: false })
  @IsNumber()
  @IsOptional()
  oldPrice?: number;

  @ApiProperty({ example: 12, required: false, default: 0 })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiProperty({ example: 'Yangi', required: false })
  @IsString()
  @IsOptional()
  badge?: string;

  @ApiProperty({ example: 'sale', required: false })
  @IsString()
  @IsOptional()
  badgeClass?: string;

  @ApiProperty({ example: 'https://images.unsplash.com/...' })
  @IsString()
  @IsNotEmpty()
  mainImage: string;

  @ApiProperty({ example: ['url1', 'url2'], required: false })
  @IsOptional()
  images?: any; // JSON in DB

  @ApiProperty({ example: 'Detailed product description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: [{icon: 'fa-microchip', val: 'A17'}], required: false })
  @IsOptional()
  specs?: any; // JSON in DB
}
