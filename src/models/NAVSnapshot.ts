import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity('nav_snapshots')
export class NAVSnapshot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAssets: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalDebts: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  netAssetValue: number;

  @Column({ type: 'text', nullable: true })
  breakdown: string; // JSON object with asset group breakdown

  @ManyToOne(() => User, user => user.navSnapshots, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  snapshotDate: Date;
}
