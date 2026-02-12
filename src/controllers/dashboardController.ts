import { Request, Response } from 'express';
import { NAVService } from '../services/navService';
import { AssetService } from '../services/assetService';
import { DebtService } from '../services/debtService';
import { AssetGroupService } from '../services/assetGroupService';

const navService = new NAVService();
const assetService = new AssetService();
const debtService = new DebtService();
const assetGroupService = new AssetGroupService();

export class DashboardController {
  async index(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;

      // Get current NAV
      const currentNAV = await navService.calculateCurrentNAV(userId);

      // Get recent snapshots for chart
      const recentSnapshots = await navService.getSnapshots(userId, 30);

      // Get asset groups with values
      const assetGroups = await assetGroupService.getTotalValueByGroup(userId);

      // Get recent assets
      const recentAssets = (await assetService.getAllByUserId(userId)).slice(0, 5);

      // Get recent debts
      const recentDebts = (await debtService.getAllByUserId(userId)).slice(0, 5);

      res.render('dashboard/index', {
        title: 'Tổng quan',
        user: req.session,
        currentNAV,
        assetGroups,
        recentAssets,
        recentDebts,
        recentSnapshots,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      req.flash('error', 'Có lỗi xảy ra khi tải trang');
      res.redirect('/auth/login');
    }
  }

  async reports(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();

      // Get monthly snapshots for the year
      const monthlySnapshots = await navService.getMonthlySnapshots(userId, year);

      // Get yearly snapshots (last 5 years)
      const yearlySnapshots = await navService.getYearlySnapshots(userId, 5);

      // Get current NAV
      const currentNAV = await navService.calculateCurrentNAV(userId);

      res.render('dashboard/reports', {
        title: 'Báo cáo thống kê',
        user: req.session,
        currentNAV,
        monthlySnapshots,
        yearlySnapshots,
        selectedYear: year
      });
    } catch (error) {
      console.error('Error loading reports:', error);
      req.flash('error', 'Có lỗi xảy ra khi tải báo cáo');
      res.redirect('/dashboard');
    }
  }

  async createSnapshot(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;

      await navService.createSnapshot(userId);

      req.flash('success', 'Đã tạo snapshot NAV thành công');
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Error creating snapshot:', error);
      req.flash('error', 'Có lỗi xảy ra khi tạo snapshot');
      res.redirect('/dashboard');
    }
  }
}
