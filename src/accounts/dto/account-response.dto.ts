import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class AccountResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  personId!: number;

  @ApiProperty({ example: 0 })
  balance!: number;

  @ApiProperty({ example: true })
  activeFlag!: boolean;

  @ApiProperty({ example: 1, description: '1 = CHECKING, 2 = SAVINGS' })
  accountType!: number;

  @ApiProperty({ example: 1000 })
  dailyWithdrawalLimit!: number;

  @ApiProperty({
    example: '2026-04-27T09:11:25.448Z',
  })
  @Type(() => Date)
  @IsDate()
  createdAt!: Date;
}
