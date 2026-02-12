import { AppDataSource } from '../config/database';
import { NAVSnapshot } from '../models/NAVSnapshot';
import { AssetService } from './assetService';
import { AssetGroupService } from './assetGroupService';
import { DebtService } from './debtService';
import { Between } from 'typeorm';
import { convertToVND } from '../config/currencies';

export class NAVService {
  private navRepository = AppDataSource.getRepository(NAVSnapshot);
  private assetService = new AssetService();
  private assetGroupService = new AssetGroupService();
  private debtService = new DebtService();

  async calculateCurrentNAV(userId: number): Promise<{
    totalAssets: number;
    totalDebts: number;
    netAssetValue: number;
    breakdown: any;
  }> {
    const assets = await this.assetService.getAllByUserId(userId);
    const debts = await this.debtService.getAllByUserId(userId);
    const assetGroups = await this.assetGroupService.getTotalValueByGroup(userId);

    const totalAssets = assets.reduce((sum, asset) => sum + convertToVND(Number(asset.currentValue), asset.currency), 0);
    const totalDebts = debts
      .filter(debt => debt.status === 'active')
      .reduce((sum, debt) => sum + convertToVND(Number(debt.amount), debt.currency), 0);
    const netAssetValue = totalAssets - totalDebts;

    const breakdown = {
      assetGroups: assetGroups,
      assetCount: assets.length,
      debtCount: debts.filter(debt => debt.status === 'active').length
    };

    return {
      totalAssets,
      totalDebts,
      netAssetValue,
      breakdown
    };
  }

  async createSnapshot(userId: number): Promise<NAVSnapshot> {
    const nav = await this.calculateCurrentNAV(userId);

    const snapshot = this.navRepository.create({
      userId,
      totalAssets: nav.totalAssets,
      totalDebts: nav.totalDebts,
      netAssetValue: nav.netAssetValue,
      breakdown: JSON.stringify(nav.breakdown)
    });

    return await this.navRepository.save(snapshot);
  }

  async getSnapshots(userId: number, limit: number = 30): Promise<NAVSnapshot[]> {
    return await this.navRepository.find({
      where: { userId },
      order: { snapshotDate: 'DESC' },
      take: limit
    });
  }

  async getSnapshotsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<NAVSnapshot[]> {
    return await this.navRepository.find({
      where: {
        userId,
        snapshotDate: Between(startDate, endDate)
      },
      order: { snapshotDate: 'ASC' }
    });
  }

  async getMonthlySnapshots(userId: number, year: number): Promise<NAVSnapshot[]> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    return await this.getSnapshotsByDateRange(userId, startDate, endDate);
  }

  async getYearlySnapshots(userId: number, years: number = 5): Promise<NAVSnapshot[]> {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear - years, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

    return await this.getSnapshotsByDateRange(userId, startDate, endDate);
  }
}
