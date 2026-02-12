import { Request, Response } from 'express';
import { AssetService } from '../services/assetService';
import { AssetGroupService } from '../services/assetGroupService';
import { t } from '../config/i18n';
import { cryptoTokens } from '../config/cryptoTokens';

const assetService = new AssetService();
const assetGroupService = new AssetGroupService();

export class AssetController {
  async index(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;
      const assets = await assetService.getAllByUserId(userId);

      res.render('assets/index', {
        title: t(locale, 'assets.title'),
        assets,
        user: req.session,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching assets:', error);
      req.flash('error', t(locale, 'flash.loadDataError'));
      res.redirect('/dashboard');
    }
  }

  async showCreateForm(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;
      const assetGroups = await assetGroupService.getAllByUserId(userId);

      res.render('assets/create', {
        title: t(locale, 'assets.addNew'),
        assetGroups,
        cryptoTokens,
        user: req.session,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error loading create form:', error);
      req.flash('error', t(locale, 'flash.genericError'));
      res.redirect('/assets');
    }
  }

  async create(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;
      const { assetGroupId, name, description, currentValue, quantity, coinGeckoId } = req.body;

      const group = await assetGroupService.getById(parseInt(assetGroupId), userId);
      const currency = group?.currency || 'VND';

      await assetService.create(
        userId,
        parseInt(assetGroupId),
        name,
        description,
        parseFloat(currentValue),
        parseFloat(quantity),
        currency,
        locale,
        group?.type === 'crypto' ? coinGeckoId : undefined
      );

      req.flash('success', t(locale, 'flash.assetCreateSuccess'));
      res.redirect('/assets');
    } catch (error) {
      console.error('Error creating asset:', error);
      req.flash('error', t(locale, 'flash.assetCreateError'));
      res.redirect('/assets/create');
    }
  }

  async showEditForm(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;
      const assetId = parseInt(req.params.id);

      const asset = await assetService.getById(assetId, userId);
      const assetGroups = await assetGroupService.getAllByUserId(userId);

      if (!asset) {
        req.flash('error', t(locale, 'flash.assetNotFound'));
        return res.redirect('/assets');
      }

      res.render('assets/edit', {
        title: t(locale, 'assets.editTitle'),
        asset,
        assetGroups,
        cryptoTokens,
        user: req.session,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching asset:', error);
      req.flash('error', t(locale, 'flash.genericError'));
      res.redirect('/assets');
    }
  }

  async update(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;
      const assetId = parseInt(req.params.id);
      const { assetGroupId, name, description, currentValue, quantity, coinGeckoId } = req.body;

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
        currency,
        locale,
        group?.type === 'crypto' ? coinGeckoId : undefined
      );

      if (!updated) {
        req.flash('error', t(locale, 'flash.assetNotFound'));
        return res.redirect('/assets');
      }

      req.flash('success', t(locale, 'flash.assetUpdateSuccess'));
      res.redirect('/assets');
    } catch (error) {
      console.error('Error updating asset:', error);
      req.flash('error', t(locale, 'flash.updateError'));
      res.redirect(`/assets/${req.params.id}/edit`);
    }
  }

  async delete(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;
      const assetId = parseInt(req.params.id);

      const deleted = await assetService.delete(assetId, userId);

      if (deleted) {
        req.flash('success', t(locale, 'flash.assetDeleteSuccess'));
      } else {
        req.flash('error', t(locale, 'flash.assetNotFound'));
      }

      res.redirect('/assets');
    } catch (error) {
      console.error('Error deleting asset:', error);
      req.flash('error', t(locale, 'flash.deleteError'));
      res.redirect('/assets');
    }
  }

  async showPriceHistory(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;
      const assetId = parseInt(req.params.id);

      const asset = await assetService.getById(assetId, userId);
      const priceHistory = await assetService.getPriceHistory(assetId, userId);

      if (!asset) {
        req.flash('error', t(locale, 'flash.assetNotFound'));
        return res.redirect('/assets');
      }

      // Plain data for chart serialization (TypeORM entities may not serialize cleanly)
      const chartData = priceHistory.slice().reverse().map(h => ({
        value: Number(h.value),
        date: h.recordedAt
      }));

      const isCryptoAsset = asset.assetGroup?.type === 'crypto' && asset.coinGeckoId;

      res.render('assets/history', {
        title: t(locale, 'assets.priceHistory') + ' - ' + asset.name,
        asset,
        priceHistory,
        chartData,
        isCryptoAsset,
        user: req.session,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching price history:', error);
      req.flash('error', t(locale, 'flash.genericError'));
      res.redirect('/assets');
    }
  }

  async refreshPrice(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;
      const assetId = parseInt(req.params.id);

      const result = await assetService.refreshCryptoPrice(assetId, userId, locale);

      if (result.success) {
        req.flash('success', t(locale, 'flash.priceRefreshSuccess'));
      } else {
        req.flash('error', t(locale, 'flash.priceRefreshError'));
      }

      res.redirect(`/assets/${assetId}/history`);
    } catch (error) {
      console.error('Error refreshing price:', error);
      req.flash('error', t(locale, 'flash.priceRefreshError'));
      res.redirect('/assets');
    }
  }

  async refreshAllPrices(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;

      const result = await assetService.refreshAllCryptoPrices(userId, locale);

      if (result.updated > 0) {
        req.flash('success', t(locale, 'flash.allPricesRefreshSuccess', { count: result.updated.toString() }));
      } else if (result.failed > 0) {
        req.flash('error', t(locale, 'flash.priceRefreshError'));
      } else {
        req.flash('info', t(locale, 'flash.noCryptoAssets'));
      }

      res.redirect('/assets');
    } catch (error) {
      console.error('Error refreshing all prices:', error);
      req.flash('error', t(locale, 'flash.priceRefreshError'));
      res.redirect('/assets');
    }
  }
}
