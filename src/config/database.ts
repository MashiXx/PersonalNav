import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { AssetGroup } from '../models/AssetGroup';
import { Asset } from '../models/Asset';
import { Debt } from '../models/Debt';
import { PriceHistory } from '../models/PriceHistory';
import { NAVSnapshot } from '../models/NAVSnapshot';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: process.env.DB_DATABASE || './data/personal_nav.sqlite',
  synchronize: true, // Auto-create tables (disable in production)
  logging: process.env.NODE_ENV === 'development',
  entities: [User, AssetGroup, Asset, Debt, PriceHistory, NAVSnapshot],
  migrations: [],
  subscribers: [],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✓ Database connected successfully');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
};
