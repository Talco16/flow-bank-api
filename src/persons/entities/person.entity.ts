import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';

@Entity('persons')
export class Person {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  name!: string;

  @Column({ unique: true })
  document!: string;

  @Column({ type: 'date' })
  birthDate!: Date;

  @OneToMany(() => Account, (account) => account.person)
  accounts!: Account[];
}
