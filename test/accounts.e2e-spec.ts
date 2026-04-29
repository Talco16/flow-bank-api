/* eslint-disable @typescript-eslint/no-unsafe-argument */
/// <reference types="jest" />

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';

type AccountResponse = {
  id: number;
  personId: number;
  balance: number;
  activeFlag: boolean;
  accountType: number;
  dailyWithdrawalLimit: number;
  createdAt: string;
};

type ErrorResponse = {
  message: string | string[];
  error: string;
  statusCode: number;
};

describe('Accounts E2E', () => {
  let app: INestApplication;
  let accountId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create an account', async () => {
    const response = await request(app.getHttpServer())
      .post('/accounts')
      .send({
        personId: 1,
        dailyWithdrawalLimit: 1000,
        accountType: 1,
      })
      .expect(201);

    const body = response.body as AccountResponse;

    expect(body).toMatchObject({
      personId: 1,
      balance: 0,
      activeFlag: true,
      accountType: 1,
      dailyWithdrawalLimit: 1000,
    });

    expect(body.id).toBeDefined();
    expect(body.createdAt).toBeDefined();

    accountId = body.id;
  });

  it('should deposit money into the account', async () => {
    const response = await request(app.getHttpServer())
      .post(`/accounts/${accountId}/deposit`)
      .send({ value: 200 })
      .expect(200);

    const body = response.body as AccountResponse;

    expect(body).toMatchObject({
      id: accountId,
      balance: 200,
      activeFlag: true,
    });
  });

  it('should withdraw money from the account', async () => {
    const response = await request(app.getHttpServer())
      .post(`/accounts/${accountId}/withdraw`)
      .send({ value: 50 })
      .expect(200);

    const body = response.body as AccountResponse;

    expect(body).toMatchObject({
      id: accountId,
      balance: 150,
      activeFlag: true,
    });
  });

  it('should reject invalid deposit value', async () => {
    const response = await request(app.getHttpServer())
      .post(`/accounts/${accountId}/deposit`)
      .send({ value: 0 })
      .expect(400);

    const body = response.body as ErrorResponse;

    expect(body.statusCode).toBe(400);
    expect(body.message).toBeDefined();
  });

  it('should block account', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/accounts/${accountId}/block`)
      .expect(200);

    const body = response.body as AccountResponse;

    expect(body).toMatchObject({
      id: accountId,
      activeFlag: false,
    });
  });

  it('should reject deposit on blocked account', async () => {
    const response = await request(app.getHttpServer())
      .post(`/accounts/${accountId}/deposit`)
      .send({ value: 100 })
      .expect(400);

    const body = response.body as ErrorResponse;

    expect(body.statusCode).toBe(400);
    expect(body.message).toBeDefined();
  });
});
