import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType } from '../entities/account.entity';

export class CreateAccountDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  personId!: number;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Maximum amount allowed for daily withdrawal',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyWithdrawalLimit?: number;

  @ApiPropertyOptional({
    enum: AccountType,
    example: 1,
    description: '1 = CHECKING, 2 = SAVINGS',
  })
  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType;
}
