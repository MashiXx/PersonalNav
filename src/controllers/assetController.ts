import { Request, Response } from 'express';
import { AssetService } from '../services/assetService';
import { AssetGroupService } from '../services/assetGroupService';

const assetService = new AssetService();
const assetGroupService = new AssetGroupService();

export class AssetController {
  async index(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const assets = await assetService.getAllByUserId(userId);

      res.render('assets/index', {
        title: 'Quản lý tài sản',
        assets,
        user: req.session,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching assets:', error);
      req.flash('error', 'Có lỗi xảy ra khi tải dữ liệu');
      res.redirect('/dashboard');
    }
  }

  async showCreateForm(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const assetGroups = await assetGroupService.getAllByUserId(userId);

      res.render('assets/create', {
        title: 'Thêm tài sản mới',
        assetGroups,
        user: req.session,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error loading create form:', error);
      req.flash('error', 'Có lỗi xảy ra');
      res.redirect('/assets');
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const { assetGroupId, name, description, currentValue, quantity } = req.body;

      const group = await assetGroupService.getById(parseInt(assetGroupId), userId);
      const currency = group?.currency || 'VND';

      await assetService.create(
        userId,
        parseInt(assetGroupId),
        name,
        description,
        parseFloat(currentValue),
        parseFloat(quantity),
        currency
      );

      req.flash('success', 'Thêm tài sản thành công');
      res.redirect('/assets');
    } catch (error) {
      console.error('Error creating asset:', error);
      req.flash('error', 'Có lỗi xảy ra khi thêm tài sản');
      res.redirect('/assets/create');
    }
  }

  async showEditForm(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const assetId = parseInt(req.params.id);

      const asset = await assetService.getById(assetId, userId);
      const assetGroups = await assetGroupService.getAllByUserId(userId);

      if (!asset) {
        req.flash('error', 'Không tìm thấy tài sản');
        return res.redirect('/assets');
      }

      res.render('assets/edit', {
        title: 'Chỉnh sửa tài sản',
        asset,
        assetGroups,
        user: req.session,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching asset:', error);
      req.flash('error', 'Có lỗi xảy ra');
      res.redirect('/assets');
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const assetId = parseInt(req.params.id);
      const { assetGroupId, name, description, currentValue, quantity } = req.body;

      const group = await assetGroupService.getById(parseInt(assetGroupId), userId);
      const currency = group?.currency || 'VND';

      const updated = await assetService.update(
        assetId,
        userId,
        parseInt(assetGroupId),
        name,
        description,
        parseFloat(currentValue),
        parseFloat(quantity),
        currency
      );

      if (!updated) {
        req.flash('error', 'Không tìm thấy tài sản');
        return res.redirect('/assets');
      }

      req.flash('success', 'Cập nhật tài sản thành công');
      res.redirect('/assets');
    } catch (error) {
      console.error('Error updating asset:', error);
      req.flash('error', 'Có lỗi xảy ra khi cập nhật');
      res.redirect(`/assets/${req.params.id}/edit`);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const assetId = parseInt(req.params.id);

      const deleted = await assetService.delete(assetId, userId);

      if (deleted) {
        req.flash('success', 'Xóa tài sản thành công');
      } else {
        req.flash('error', 'Không tìm thấy tài sản');
      }

      res.redirect('/assets');
    } catch (error) {
      console.error('Error deleting asset:', error);
      req.flash('error', 'Có lỗi xảy ra khi xóa');
      res.redirect('/assets');
    }
  }

  async showPriceHistory(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const assetId = parseInt(req.params.id);

      const asset = await assetService.getById(assetId, userId);
      const priceHistory = await assetService.getPriceHistory(assetId, userId);

      if (!asset) {
        req.flash('error', 'Không tìm thấy tài sản');
        return res.redirect('/assets');
      }

      // Plain data for chart serialization (TypeORM entities may not serialize cleanly)
      const chartData = priceHistory.slice().reverse().map(h => ({
        value: Number(h.value),
        date: h.recordedAt
      }));

      res.render('assets/history', {
        title: 'Lịch sử giá - ' + asset.name,
        asset,
        priceHistory,
        chartData,
        user: req.session
      });
    } catch (error) {
      console.error('Error fetching price history:', error);
      req.flash('error', 'Có lỗi xảy ra');
      res.redirect('/assets');
    }
  }
}
