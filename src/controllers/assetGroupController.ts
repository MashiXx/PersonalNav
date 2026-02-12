import { Request, Response } from 'express';
import { AssetGroupService } from '../services/assetGroupService';
import { UploadService } from '../services/uploadService';
import { convertToVND } from '../config/currencies';

const assetGroupService = new AssetGroupService();
const uploadService = new UploadService();

export class AssetGroupController {
  async index(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const groups = await assetGroupService.getTotalValueByGroup(userId);

      res.render('asset-groups/index', {
        title: 'Quản lý nhóm tài sản',
        groups,
        user: req.session,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching asset groups:', error);
      req.flash('error', 'Có lỗi xảy ra khi tải dữ liệu');
      res.redirect('/dashboard');
    }
  }

  async show(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const groupId = parseInt(req.params.id);

      const group = await assetGroupService.getByIdWithHistory(groupId, userId);

      if (!group) {
        req.flash('error', 'Không tìm thấy nhóm tài sản');
        return res.redirect('/asset-groups');
      }

      const totalValue = group.assets.reduce((sum, a) => sum + convertToVND(Number(a.currentValue), a.currency), 0);

      // Plain data for chart serialization (TypeORM entities may not serialize cleanly)
      const assetsChartData = group.assets.map(a => ({
        name: a.name,
        value: Number(a.currentValue),
        priceHistory: (a.priceHistory || []).map(ph => ({
          value: Number(ph.value),
          date: ph.recordedAt
        }))
      }));

      res.render('asset-groups/show', {
        title: group.name,
        group,
        totalValue,
        assetsChartData,
        user: req.session,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error showing asset group:', error);
      req.flash('error', 'Có lỗi xảy ra');
      res.redirect('/asset-groups');
    }
  }

  async showCreateForm(req: Request, res: Response) {
    const defaultIcons = uploadService.getDefaultIcons();
    res.render('asset-groups/create', {
      title: 'Tạo nhóm tài sản mới',
      user: req.session,
      defaultIcons,
      error: req.flash('error')
    });
  }

  async create(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const { name, description, type, icon, currency } = req.body;

      await assetGroupService.create(userId, name, description, type, icon, currency);

      req.flash('success', 'Tạo nhóm tài sản thành công');
      res.redirect('/asset-groups');
    } catch (error) {
      console.error('Error creating asset group:', error);
      req.flash('error', 'Có lỗi xảy ra khi tạo nhóm tài sản');
      res.redirect('/asset-groups/create');
    }
  }

  async showEditForm(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const groupId = parseInt(req.params.id);

      const group = await assetGroupService.getById(groupId, userId);

      if (!group) {
        req.flash('error', 'Không tìm thấy nhóm tài sản');
        return res.redirect('/asset-groups');
      }

      const defaultIcons = uploadService.getDefaultIcons();
      res.render('asset-groups/edit', {
        title: 'Chỉnh sửa nhóm tài sản',
        group,
        defaultIcons,
        user: req.session,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching asset group:', error);
      req.flash('error', 'Có lỗi xảy ra');
      res.redirect('/asset-groups');
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const groupId = parseInt(req.params.id);
      const { name, description, type, icon, currency } = req.body;

      const updated = await assetGroupService.update(groupId, userId, name, description, type, icon, currency);

      if (!updated) {
        req.flash('error', 'Không tìm thấy nhóm tài sản');
        return res.redirect('/asset-groups');
      }

      req.flash('success', 'Cập nhật nhóm tài sản thành công');
      res.redirect('/asset-groups');
    } catch (error) {
      console.error('Error updating asset group:', error);
      req.flash('error', 'Có lỗi xảy ra khi cập nhật');
      res.redirect(`/asset-groups/${req.params.id}/edit`);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const groupId = parseInt(req.params.id);

      const result = await assetGroupService.delete(groupId, userId);

      if (result.success) {
        req.flash('success', result.message || 'Xóa nhóm tài sản thành công');
      } else {
        req.flash('error', result.message || 'Không thể xóa nhóm tài sản');
      }

      res.redirect('/asset-groups');
    } catch (error) {
      console.error('Error deleting asset group:', error);
      req.flash('error', 'Có lỗi xảy ra khi xóa');
      res.redirect('/asset-groups');
    }
  }
}
