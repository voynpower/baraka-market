import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 'shipping', enum: ['pending', 'shipping', 'completed', 'cancelled'] })
  @IsString()
  @IsIn(['pending', 'shipping', 'completed', 'cancelled'])
  status: string;
}
