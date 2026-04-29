import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  Repository,
  Between,
  FindOperator,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';

import { Account, AccountType } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account-request.dto';
import { AccountResponseDto } from './dto/account-response.dto';
import { Person } from '../persons/entities/person.entity';
import {
  Transaction,
  TransactionType,
} from '../transactions/entities/transaction.entity';
import { DepositRequestDto } from './dto/deposit-request.dto';
import { BalanceResponseDto } from './dto/balance-response.dto';
import { WithdrawRequestDto } from './dto/withdraw-request.dto';
import { TransactionsStatementQueryPeriodDto } from './dto/transactions-statement-query-period.dto';
import { TransactionResponseDto } from './dto/transactions-response.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,

    private readonly dataSource: DataSource,
  ) {}

  async createNewAccount(dto: CreateAccountDto): Promise<AccountResponseDto> {
    await this.findPersonOrFail(dto.personId);

    const account = this.accountRepository.create({
      personId: dto.personId,
      balance: 0,
      activeFlag: true,
      dailyWithdrawalLimit: dto.dailyWithdrawalLimit ?? 1000,
      accountType: dto.accountType ?? AccountType.CHECKING,
    });

    const saved = await this.accountRepository.save(account);

    return this.toResponseDto(saved);
  }

  async depositMoney(
    accountId: number,
    dto: DepositRequestDto,
  ): Promise<AccountResponseDto> {
    return this.applyAccountTransaction(
      accountId,
      dto.value,
      TransactionType.DEPOSIT,
    );
  }

  async withdrawMoney(
    accountId: number,
    dto: WithdrawRequestDto,
  ): Promise<AccountResponseDto> {
    return this.applyAccountTransaction(
      accountId,
      dto.value,
      TransactionType.WITHDRAW,
    );
  }

  blockAccount(id: number) {
    return this.setAccountStatus(id, false);
  }

  unblockAccount(id: number) {
    return this.setAccountStatus(id, true);
  }

  async getAccountBalance(accountId: number): Promise<BalanceResponseDto> {
    const account = await this.findAccountOrFail(accountId);

    return {
      accountId: account.id,
      balance: account.balance,
    };
  }

  async getAccountStatement(
    accountId: number,
    query: TransactionsStatementQueryPeriodDto,
  ): Promise<TransactionResponseDto[]> {
    await this.findAccountOrFail(accountId);

    const where = this.buildTransactionStatementWhere(accountId, query);

    const transactions = await this.dataSource.getRepository(Transaction).find({
      where,
      order: { createdAt: 'ASC' },
    });

    return transactions.map((transaction) =>
      this.toTransactionResponseDto(transaction),
    );
  }

  private buildTransactionStatementWhere(
    accountId: number,
    query: TransactionsStatementQueryPeriodDto,
  ): {
    accountId: number;
    createdAt?: Date | FindOperator<Date>;
  } {
    const where: {
      accountId: number;
      createdAt?: Date | FindOperator<Date>;
    } = { accountId };

    if (query.from && query.to) {
      where.createdAt = Between(
        this.getStartOfDay(query.from),
        this.getEndOfDay(query.to),
      );
    } else if (query.from) {
      where.createdAt = MoreThanOrEqual(this.getStartOfDay(query.from));
    } else if (query.to) {
      where.createdAt = LessThanOrEqual(this.getEndOfDay(query.to));
    }

    return where;
  }

  private toTransactionResponseDto(
    transaction: Transaction,
  ): TransactionResponseDto {
    return {
      id: transaction.id,
      accountId: transaction.accountId,
      type: this.mapTransactionType(transaction.type),
      value: transaction.value,
      createdAt: transaction.createdAt,
    };
  }

  private mapTransactionType(type: TransactionType): string {
    return TransactionType[type];
  }

  private async applyAccountTransaction(
    accountId: number,
    value: number,
    type: TransactionType,
  ): Promise<AccountResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const account = await this.findAccountOrFail(accountId, manager);

      this.validateAccountIsActive(account);
      this.validatePositiveValue(value);

      if (type === TransactionType.WITHDRAW) {
        this.validateWithdrawal(account, value);
        account.balance -= value;
      } else {
        account.balance += value;
      }

      const savedAccount = await manager.save(Account, account);

      await manager.save(Transaction, {
        accountId: savedAccount.id,
        type,
        value,
      });

      return this.toResponseDto(savedAccount);
    });
  }

  private async findAccountOrFail(
    accountId: number,
    manager?: EntityManager,
  ): Promise<Account> {
    const repository = manager
      ? manager.getRepository(Account)
      : this.accountRepository;

    const account = await repository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  private async findPersonOrFail(personId: number): Promise<Person> {
    const person = await this.personRepository.findOne({
      where: { id: personId },
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    return person;
  }

  private validateAccountIsActive(account: Account): void {
    if (!account.activeFlag) {
      throw new BadRequestException('Account is inactive');
    }
  }

  private validatePositiveValue(value: number): void {
    if (value <= 0) {
      throw new BadRequestException('Value must be greater than zero');
    }
  }

  private validateWithdrawal(account: Account, value: number): void {
    if (account.balance < value) {
      throw new BadRequestException('Insufficient funds');
    }

    if (value > account.dailyWithdrawalLimit) {
      throw new BadRequestException('Daily withdrawal limit exceeded');
    }
  }

  private toResponseDto(account: Account): AccountResponseDto {
    return {
      id: account.id,
      personId: account.personId,
      balance: account.balance,
      activeFlag: account.activeFlag,
      accountType: account.accountType,
      dailyWithdrawalLimit: account.dailyWithdrawalLimit,
      createdAt: account.createdAt,
    };
  }

  private async setAccountStatus(
    accountId: number,
    isActive: boolean,
  ): Promise<AccountResponseDto> {
    const account = await this.findAccountOrFail(accountId);

    if (account.activeFlag === isActive) {
      throw new BadRequestException(
        isActive ? 'Account already active' : 'Account already blocked',
      );
    }

    account.activeFlag = isActive;

    const saved = await this.accountRepository.save(account);

    return this.toResponseDto(saved);
  }

  private getStartOfDay(date: string): Date {
    return new Date(`${date}T00:00:00.000Z`);
  }

  private getEndOfDay(date: string): Date {
    return new Date(`${date}T23:59:59.999Z`);
  }
}
