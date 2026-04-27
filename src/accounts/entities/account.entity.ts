import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Person } from '../../persons/entities/person.entity';

export enum AccountType {
  CHECKING = 1,
  SAVINGS = 2,
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  personId!: number;

  @ManyToOne(() => Person, { nullable: false })
  @JoinColumn({ name: 'personId' })
  person!: Person;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  balance!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 1000,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  dailyWithdrawalLimit!: number;

  @Column({ default: true })
  activeFlag!: boolean;

  @Column({
    type: 'int',
    default: AccountType.CHECKING,
  })
  accountType!: AccountType;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
