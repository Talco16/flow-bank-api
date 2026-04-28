# Project Architecture

## Overview

Flow Bank API is a modular REST API built with NestJS, TypeScript, PostgreSQL, and TypeORM.

The project follows clean architecture principles with clear separation of concerns:

- Controllers – handle HTTP requests and responses
- Services – contain business logic
- Entities – represent database tables
- DTOs – define request/response contracts
- Database transactions – ensure financial consistency

## Modules

### Accounts Module

Responsible for all account-related operations:

- Create account
- Deposit money
- Withdraw money
- Get balance
- Block / unblock account
- Retrieve account statement

src/accounts/
accounts.controller.ts
accounts.service.ts
entities/account.entity.ts
dto/

### Persons Module

Responsible for the Person entity only.

src/persons/
persons.module.ts
entities/person.entity.ts

### Transactions Module

Responsible for transaction history.

src/transactions/
transactions.module.ts
entities/transaction.entity.ts

## Database Design

### Person

- id
- name
- document
- birthDate

### Account

- id
- personId
- balance
- dailyWithdrawalLimit
- activeFlag
- accountType
- createdAt
- updatedAt

### Transaction

- id
- accountId
- type
- value
- createdAt

## Relationships

Person 1 → N Account  
Account 1 → N Transaction

## Financial Consistency

Operations are executed inside DB transactions to ensure atomicity.

## Error Handling

- 400 Bad Request
- 404 Not Found

## Validation

Using class-validator and ValidationPipe.

## API Documentation

Available at: http://localhost:3000/api

## Design Decisions

- PostgreSQL for reliability
- TypeORM for ORM and transactions
- No Person controller per requirements

## Scalability

- Authentication
- Pagination
- Transfers
