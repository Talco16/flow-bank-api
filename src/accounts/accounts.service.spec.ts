import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { AccountsService } from './accounts.service';
import { Account, AccountType } from './entities/account.entity';
import { Person } from '../persons/entities/person.entity';
import {
  Transaction,
  TransactionType,
} from '../transactions/entities/transaction.entity';

describe('AccountsService', () => {
  let service: AccountsService;

  let accountRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
  };

  let personRepository: {
    findOne: jest.Mock;
  };

  let dataSource: {
    transaction: jest.Mock;
    getRepository: jest.Mock;
  };

  const baseAccount: Account = {
    id: 1,
    personId: 1,
    person: {} as Person,
    balance: 100,
    dailyWithdrawalLimit: 1000,
    activeFlag: true,
    accountType: AccountType.CHECKING,
    createdAt: new Date('2026-04-27T09:11:25.448Z'),
    updatedAt: new Date('2026-04-27T09:11:25.448Z'),
  };

  beforeEach(() => {
    accountRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    personRepository = {
      findOne: jest.fn(),
    };

    dataSource = {
      transaction: jest.fn(),
      getRepository: jest.fn(),
    };

    service = new AccountsService(
      accountRepository as unknown as Repository<Account>,
      personRepository as unknown as Repository<Person>,
      dataSource as unknown as DataSource,
    );
  });

  it('should create a new account', async () => {
    const createdAccount = {
      ...baseAccount,
      balance: 0,
    };

    personRepository.findOne.mockResolvedValue({ id: 1 });
    accountRepository.create.mockReturnValue(createdAccount);
    accountRepository.save.mockResolvedValue(createdAccount);

    const result = await service.createNewAccount({
      personId: 1,
      dailyWithdrawalLimit: 1000,
      accountType: AccountType.CHECKING,
    });

    expect(personRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(accountRepository.create).toHaveBeenCalledWith({
      personId: 1,
      balance: 0,
      activeFlag: true,
      dailyWithdrawalLimit: 1000,
      accountType: AccountType.CHECKING,
    });
    expect(result).toEqual({
      id: 1,
      personId: 1,
      balance: 0,
      activeFlag: true,
      accountType: AccountType.CHECKING,
      dailyWithdrawalLimit: 1000,
      createdAt: createdAccount.createdAt,
    });
  });

  it('should throw NotFoundException when person does not exist', async () => {
    personRepository.findOne.mockResolvedValue(null);

    await expect(
      service.createNewAccount({
        personId: 999,
        dailyWithdrawalLimit: 1000,
        accountType: AccountType.CHECKING,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should return account balance', async () => {
    accountRepository.findOne.mockResolvedValue(baseAccount);

    const result = await service.getAccountBalance(1);

    expect(accountRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result).toEqual({
      accountId: 1,
      balance: 100,
    });
  });

  it('should throw NotFoundException when account does not exist', async () => {
    accountRepository.findOne.mockResolvedValue(null);

    await expect(service.getAccountBalance(999)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should deposit money into an account', async () => {
    const account = { ...baseAccount };

    const manager = createMockManager(account);

    dataSource.transaction.mockImplementation(
      async (callback: (manager: EntityManager) => Promise<unknown>) =>
        callback(manager as unknown as EntityManager),
    );

    const result = await service.depositMoney(1, { value: 50 });

    expect(result.balance).toBe(150);
    expect(manager.save).toHaveBeenCalledWith(Account, {
      ...account,
      balance: 150,
    });
    expect(manager.save).toHaveBeenCalledWith(Transaction, {
      accountId: 1,
      type: TransactionType.DEPOSIT,
      value: 50,
    });
  });

  it('should withdraw money from an account', async () => {
    const account = { ...baseAccount };

    const manager = createMockManager(account);

    dataSource.transaction.mockImplementation(
      async (callback: (manager: EntityManager) => Promise<unknown>) =>
        callback(manager as unknown as EntityManager),
    );

    const result = await service.withdrawMoney(1, { value: 50 });

    expect(result.balance).toBe(50);
    expect(manager.save).toHaveBeenCalledWith(Account, {
      ...account,
      balance: 50,
    });
    expect(manager.save).toHaveBeenCalledWith(Transaction, {
      accountId: 1,
      type: TransactionType.WITHDRAW,
      value: 50,
    });
  });

  it('should reject transaction when account is inactive', async () => {
    const inactiveAccount = {
      ...baseAccount,
      activeFlag: false,
    };

    const manager = createMockManager(inactiveAccount);

    dataSource.transaction.mockImplementation(
      async (callback: (manager: EntityManager) => Promise<unknown>) =>
        callback(manager as unknown as EntityManager),
    );

    await expect(service.depositMoney(1, { value: 50 })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should reject deposit with invalid value', async () => {
    const account = { ...baseAccount };
    const manager = createMockManager(account);

    dataSource.transaction.mockImplementation(
      async (callback: (manager: EntityManager) => Promise<unknown>) =>
        callback(manager as unknown as EntityManager),
    );

    await expect(service.depositMoney(1, { value: 0 })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should reject withdrawal when balance is insufficient', async () => {
    const account = {
      ...baseAccount,
      balance: 20,
    };

    const manager = createMockManager(account);

    dataSource.transaction.mockImplementation(
      async (callback: (manager: EntityManager) => Promise<unknown>) =>
        callback(manager as unknown as EntityManager),
    );

    await expect(service.withdrawMoney(1, { value: 50 })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should reject withdrawal above daily limit', async () => {
    const account = {
      ...baseAccount,
      dailyWithdrawalLimit: 30,
    };

    const manager = createMockManager(account);

    dataSource.transaction.mockImplementation(
      async (callback: (manager: EntityManager) => Promise<unknown>) =>
        callback(manager as unknown as EntityManager),
    );

    await expect(service.withdrawMoney(1, { value: 50 })).rejects.toThrow(
      BadRequestException,
    );
  });
});

function createMockManager(account: Account): {
  getRepository: jest.Mock;
  save: jest.Mock;
} {
  return {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(account),
    }),
    save: jest
      .fn()
      .mockImplementation((_entity, data) => Promise.resolve(data)),
  };
}
