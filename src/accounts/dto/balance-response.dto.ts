import { ApiProperty } from '@nestjs/swagger';

export class BalanceResponseDto {
  @ApiProperty({ example: 1 })
  accountId!: number;

  @ApiProperty({ example: 250 })
  balance!: number;
}
