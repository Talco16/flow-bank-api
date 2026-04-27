import { Module } from '@nestjs/common';
import { AccountsModule } from './accounts/accounts.module';
import { PersonsModule } from './persons/persons.module';
import { TransactionsModule } from './transactions/transactions.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST') || 'localhost',
        port: parseInt(config.get<string>('DB_PORT') || '5432', 10),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // רק לפיתוח
      }),
    }),
    AccountsModule,
    PersonsModule,
    TransactionsModule,
  ],
})
export class AppModule {}
