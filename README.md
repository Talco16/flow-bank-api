# Flow Bank API

## 📌 Overview

Flow Bank API is a RESTful banking service built with NestJS, PostgreSQL, and TypeORM.

The system supports:

- Account creation
- Deposit / Withdrawal
- Balance inquiry
- Account blocking / unblocking
- Transaction statement (with optional period filtering)

---

## 🚀 Running the Project

### Option 1 – Docker (recommended)

```bash
docker compose down -v
docker compose up --build
```

API will be available at:
http://localhost:3000

Swagger:
http://localhost:3000/api

---

### Option 2 – Local

```bash
npm install
npm run build
npm run start:dev
```

---

## 🧱 Project Structure

```
src/
  accounts/
  persons/
  transactions/
```

---

## 🗄 Database & Seed

PostgreSQL is used.

Seed file:
database/init/seed.sql

Default user:
('Tal Cohen', '123456789', '1994-06-16')

Reset DB:
docker compose down -v
docker compose up --build

---

## 📡 API Endpoints

### Accounts

- POST /accounts – Create account
- POST /accounts/:id/deposit – Deposit money
- POST /accounts/:id/withdraw – Withdraw money
- GET /accounts/:id/balance – Get balance
- PATCH /accounts/:id/block – Block account
- PATCH /accounts/:id/unblock – Unblock account
- GET /accounts/:id/transactions – Get statement
  - Optional: ?from=YYYY-MM-DD&to=YYYY-MM-DD

---

## 🧪 Tests

Unit:
npm run test

E2E:
npm run test:e2e

## ⚠️ Error Handling

- 400 – Invalid input / business rule violation
- 404 – Resource not found

---

## 🧠 Design Highlights

- Transaction-safe operations (DB transactions)
- Clean separation of concerns
- DTO-based validation
- Enum-to-string mapping for readability
- Reusable service logic (no duplication)

---

## 📄 Architecture

See:
ARCHITECTURE.md

---

## 🧪 API Examples

### Create Account

POST /accounts

Request:

```json
{
  "personId": 1,
  "dailyWithdrawalLimit": 1000,
  "accountType": 1
}
```

Response:

```json
{
  "id": 1,
  "personId": 1,
  "balance": 0,
  "activeFlag": true,
  "accountType": 1,
  "dailyWithdrawalLimit": 1000,
  "createdAt": "2026-04-27T09:11:25.448Z"
}
```

---

### Deposit

POST /accounts/1/deposit

Request:

```json
{
  "value": 200
}
```

Response:

```json
{
  "id": 1,
  "personId": 1,
  "balance": 200,
  "activeFlag": true,
  "accountType": 1,
  "dailyWithdrawalLimit": 1000,
  "createdAt": "2026-04-27T09:11:25.448Z"
}
```

---

### Withdraw

POST /accounts/1/withdraw

Request:

```json
{
  "value": 50
}
```

Response:

```json
{
  "id": 1,
  "personId": 1,
  "balance": 150,
  "activeFlag": true,
  "accountType": 1,
  "dailyWithdrawalLimit": 1000,
  "createdAt": "2026-04-27T09:11:25.448Z"
}
```

---

### Get Balance

GET /accounts/1/balance

Response:

```json
{
  "accountId": 1,
  "balance": 150
}
```

---

### Block Account

PATCH /accounts/1/block

Response:

```json
{
  "id": 1,
  "activeFlag": false
}
```

---

### Get Statement

GET /accounts/1/transactions?from=2026-04-01&to=2026-04-30

Response:

```json
[
  {
    "id": 1,
    "accountId": 1,
    "type": "DEPOSIT",
    "value": 200,
    "createdAt": "2026-04-27T09:11:25.448Z"
  }
]
```

---

## 🔮 Future Improvements

- Authentication & authorization
- Pagination for statements
- Transfers between accounts
- Logging & monitoring
- Database migrations
