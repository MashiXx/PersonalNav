import { Request, Response } from 'express';
import { AssetGroupService } from '../services/assetGroupService';
import { UploadService } from '../services/uploadService';
import { convertToVND } from '../config/currencies';
import { t } from '../config/i18n';

const assetGroupService = new AssetGroupService();
const uploadService = new UploadService();

export class AssetGroupController {
  async index(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;
      const groups = await assetGroupService.getTotalValueByGroup(userId);

      res.render('asset-groups/index', {
        title: t(locale, 'assetGroups.title'),
        groups,
        user: req.session,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching asset groups:', error);
      req.flash('error', t(locale, 'flash.loadDataError'));
      res.redirect('/dashboard');
    }
  }

  async show(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;
      const groupId = parseInt(req.params.id);

      const group = await assetGroupService.getByIdWithHistory(groupId, userId);

      if (!group) {
        req.flash('error', t(locale, 'flash.assetGroupNotFound'));
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
      req.flash('error', t(locale, 'flash.genericError'));
      res.redirect('/asset-groups');
    }
  }

  async showCreateForm(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    const defaultIcons = uploadService.getDefaultIcons();
    res.render('asset-groups/create', {
      title: t(locale, 'assetGroups.createTitle'),
      user: req.session,
      defaultIcons,
      error: req.flash('error')
    });
  }

  async create(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;
      const { name, description, type, icon, currency } = req.body;

      await assetGroupService.create(userId, name, description, type, icon, currency);

      req.flash('success', t(locale, 'flash.assetGroupCreateSuccess'));
      res.redirect('/asset-groups');
    } catch (error) {
      console.error('Error creating asset group:', error);
      req.flash('error', t(locale, 'flash.assetGroupCreateError'));
      res.redirect('/asset-groups/create');
    }
  }

  async showEditForm(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;
      const groupId = parseInt(req.params.id);

      const group = await assetGroupService.getById(groupId, userId);

      if (!group) {
        req.flash('error', t(locale, 'flash.assetGroupNotFound'));
        return res.redirect('/asset-groups');
      }

      const defaultIcons = uploadService.getDefaultIcons();
      res.render('asset-groups/edit', {
        title: t(locale, 'assetGroups.editTitle'),
        group,
        defaultIcons,
        user: req.session,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching asset group:', error);
      req.flash('error', t(locale, 'flash.genericError'));
      res.redirect('/asset-groups');
    }
  }

  async update(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;
      const groupId = parseInt(req.params.id);
      const { name, description, type, icon, currency } = req.body;

      const updated = await assetGroupService.update(groupId, userId, name, description, type, icon, currency);

      if (!updated) {
        req.flash('error', t(locale, 'flash.assetGroupNotFound'));
        return res.redirect('/asset-groups');
      }

      req.flash('success', t(locale, 'flash.assetGroupUpdateSuccess'));
      res.redirect('/asset-groups');
    } catch (error) {
      console.error('Error updating asset group:', error);
      req.flash('error', t(locale, 'flash.updateError'));
      res.redirect(`/asset-groups/${req.params.id}/edit`);
    }
  }

  async delete(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;
      const groupId = parseInt(req.params.id);

      const result = await assetGroupService.delete(groupId, userId);

      if (result.success) {
        req.flash('success', t(locale, result.message || 'flash.deleteSuccess'));
      } else {
        req.flash('error', t(locale, result.message || 'flash.deleteFailed'));
      }

      res.redirect('/asset-groups');
    } catch (error) {
      console.error('Error deleting asset group:', error);
      req.flash('error', t(locale, 'flash.deleteError'));
      res.redirect('/asset-groups');
    }
  }
}
