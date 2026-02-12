import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { AssetGroup } from './AssetGroup';
import { PriceHistory } from './PriceHistory';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  currentValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'varchar', length: 10, default: 'VND' })
  currency: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  coinGeckoId: string;

  @ManyToOne(() => User, user => user.assets, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => AssetGroup, assetGroup => assetGroup.assets, { onDelete: 'CASCADE' })
  assetGroup: AssetGroup;

  @Column()
  assetGroupId: number;

  @OneToMany(() => PriceHistory, priceHistory => priceHistory.asset)
  priceHistory: PriceHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
