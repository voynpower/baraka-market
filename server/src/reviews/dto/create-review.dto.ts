// server/src/reviews/dto/create-review.dto.ts
import { IsInt, IsString, Min, Max, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Juda ajoyib mahsulot!' })
  @IsString()
  @MinLength(5)
  comment: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  productId: number;
}
