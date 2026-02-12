import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AssetGroup } from './AssetGroup';
import { Asset } from './Asset';
import { Debt } from './Debt';
import { NAVSnapshot } from './NAVSnapshot';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, default: 'default-1.svg' })
  avatar: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => AssetGroup, assetGroup => assetGroup.user)
  assetGroups: AssetGroup[];

  @OneToMany(() => Asset, asset => asset.user)
  assets: Asset[];

  @OneToMany(() => Debt, debt => debt.user)
  debts: Debt[];

  @OneToMany(() => NAVSnapshot, navSnapshot => navSnapshot.user)
  navSnapshots: NAVSnapshot[];
}
