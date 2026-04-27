import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Account, AccountType } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account-request.dto';
import { AccountResponseDto } from './dto/account-response.dto';
import { Person } from '../persons/entities/person.entity';
import {
  Transaction,
  TransactionType,
} from '../transactions/entities/transaction.entity';
import { DepositRequestDto } from './dto/deposit-request.dto';

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
    const person = await this.personRepository.findOne({
      where: { id: dto.personId },
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

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
    return this.dataSource.transaction(async (manager) => {
      const account = await manager.findOne(Account, {
        where: { id: accountId },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      if (!account.activeFlag) {
        throw new BadRequestException('Account is inactive');
      }

      //TODO: Fix error
      if (dto.value <= 0) {
        throw new BadRequestException(
          'Deposit value must be greater than zero',
        );
      }

      account.balance += dto.value;

      const savedAccount = await manager.save(Account, account);

      await manager.save(Transaction, {
        accountId: savedAccount.id,
        type: TransactionType.DEPOSIT,
        value: dto.value,
      });

      return this.toResponseDto(savedAccount);
    });
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
}
