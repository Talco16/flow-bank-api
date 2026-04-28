import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../transactions/entities/transaction.entity';

export class TransactionResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  accountId!: number;

  @ApiProperty({
    example: 'DEPOSIT',
    enum: TransactionType,
  })
  type!: string;

  @ApiProperty({ example: 100 })
  value!: number;

  @ApiProperty({ example: '2026-04-27T09:11:25.448Z' })
  createdAt!: Date;
}
