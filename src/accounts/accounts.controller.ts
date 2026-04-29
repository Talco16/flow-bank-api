import {
  Controller,
  Post,
  Body,
  ParseIntPipe,
  Param,
  Get,
  Patch,
  Query,
  HttpCode,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAccountDto } from './dto/create-account-request.dto';
import { AccountResponseDto } from './dto/account-response.dto';
import { DepositRequestDto } from './dto/deposit-request.dto';
import { BalanceResponseDto } from './dto/balance-response.dto';
import { WithdrawRequestDto } from './dto/withdraw-request.dto';
import { TransactionResponseDto } from './dto/transactions-response.dto';
import { TransactionsStatementQueryPeriodDto } from './dto/transactions-statement-query-period.dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
    type: AccountResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Person not found' })
  @Post()
  createNewAccount(@Body() dto: CreateAccountDto): Promise<AccountResponseDto> {
    return this.accountsService.createNewAccount(dto);
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
  @HttpCode(200)
  @Post(':accountId/deposit')
  depositMoney(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() dto: DepositRequestDto,
  ): Promise<AccountResponseDto> {
    return this.accountsService.depositMoney(accountId, dto);
  }

  @ApiOperation({ summary: 'Withdraw money from an account' })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal completed successfully',
    type: AccountResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid value, inactive account, insufficient funds or daily limit exceeded',
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @HttpCode(200)
  @Post(':accountId/withdraw')
  withdrawMoney(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() dto: WithdrawRequestDto,
  ): Promise<AccountResponseDto> {
    return this.accountsService.withdrawMoney(accountId, dto);
  }

  @ApiOperation({ summary: 'Get account balance' })
  @ApiResponse({
    status: 200,
    description: 'Deposit completed successfully',
    type: BalanceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Inactive account',
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @Get(':accountId/balance')
  getAccountBalance(
    @Param('accountId', ParseIntPipe) accountId: number,
  ): Promise<BalanceResponseDto> {
    return this.accountsService.getAccountBalance(accountId);
  }

  @ApiOperation({ summary: 'Block an account' })
  @ApiResponse({
    status: 200,
    description: 'Account blocked successfully',
    type: AccountResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @HttpCode(200)
  @Patch(':accountId/block')
  blockAccount(
    @Param('accountId', ParseIntPipe) accountId: number,
  ): Promise<AccountResponseDto> {
    return this.accountsService.blockAccount(accountId);
  }

  @ApiOperation({ summary: 'Unblock an account' })
  @ApiResponse({
    status: 200,
    description: 'Account unblocked successfully',
    type: AccountResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @HttpCode(200)
  @Patch(':accountId/unblock')
  unblockAccount(
    @Param('accountId', ParseIntPipe) accountId: number,
  ): Promise<AccountResponseDto> {
    return this.accountsService.unblockAccount(accountId);
  }

  @ApiOperation({ summary: 'Get account transaction statement' })
  @ApiResponse({
    status: 200,
    description: 'Account statement retrieved successfully',
    type: [TransactionResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @Get(':accountId/transactions')
  getAccountStatement(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query() query: TransactionsStatementQueryPeriodDto,
  ): Promise<TransactionResponseDto[]> {
    return this.accountsService.getAccountStatement(accountId, query);
  }
}
