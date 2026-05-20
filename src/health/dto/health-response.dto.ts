import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: 123.45, description: 'Process uptime in seconds' })
  uptime!: number;

  @ApiProperty({ example: '2026-05-20T12:34:56.789Z' })
  timestamp!: string;
}
