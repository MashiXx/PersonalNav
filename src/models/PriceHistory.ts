import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Asset } from './Asset';

@Entity('price_history')
export class PriceHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  value: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  note: string;

  @ManyToOne(() => Asset, asset => asset.priceHistory, { onDelete: 'CASCADE' })
  asset: Asset;

  @Column()
  assetId: number;

  @CreateDateColumn()
  recordedAt: Date;
}
