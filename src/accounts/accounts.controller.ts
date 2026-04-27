import { Controller, Post, Body, ParseIntPipe, Param } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAccountDto } from './dto/create-account-request.dto';
import { AccountResponseDto } from './dto/account-response.dto';
import { DepositRequestDto } from './dto/deposit-request.dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  //todo: need to add error handling like 404
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
    type: AccountResponseDto,
  })
  @Post()
  async createNewAccount(
    @Body() dto: CreateAccountDto,
  ): Promise<AccountResponseDto> {
    return await this.accountsService.createNewAccount(dto);
  }

  @ApiOperation({ summary: 'Deposit money into an account' })
  @ApiResponse({
    status: 200,
    description: 'Deposit completed successfully',
    type: AccountResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid amount or inactive account',
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @Post(':accountId/deposit')
  async depositMoney(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() dto: DepositRequestDto,
  ): Promise<AccountResponseDto> {
    return await this.accountsService.depositMoney(accountId, dto);
  }
}
