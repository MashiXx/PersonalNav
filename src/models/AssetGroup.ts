import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Asset } from './Asset';

@Entity('asset_groups')
export class AssetGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, default: 'other' })
  type: string; // real_estate, savings, stocks, crypto, other

  @Column({ nullable: true, default: 'other.svg' })
  icon: string;

  @Column({ type: 'varchar', length: 10, default: 'VND' })
  currency: string;

  @ManyToOne(() => User, user => user.assetGroups, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @OneToMany(() => Asset, asset => asset.assetGroup)
  assets: Asset[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
