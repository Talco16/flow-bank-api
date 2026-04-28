import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class AmountDto {
  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0.01)
  value!: number;
}
