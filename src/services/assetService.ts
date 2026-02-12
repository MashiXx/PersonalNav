import { AppDataSource } from '../config/database';
import { Asset } from '../models/Asset';
import { PriceHistory } from '../models/PriceHistory';
import { t } from '../config/i18n';
import { CoinGeckoService } from './coinGeckoService';

export class AssetService {
  private assetRepository = AppDataSource.getRepository(Asset);
  private priceHistoryRepository = AppDataSource.getRepository(PriceHistory);
  private coinGeckoService = new CoinGeckoService();

  async getAllByUserId(userId: number): Promise<Asset[]> {
    return await this.assetRepository.find({
      where: { userId },
      relations: ['assetGroup'],
      order: { createdAt: 'DESC' }
    });
  }

  async getById(id: number, userId: number): Promise<Asset | null> {
    return await this.assetRepository.findOne({
      where: { id, userId },
      relations: ['assetGroup', 'priceHistory']
    });
  }

  async create(
    userId: number,
    assetGroupId: number,
    name: string,
    description: string,
    currentValue: number,
    quantity: number,
    currency: string,
    locale: string = 'en',
    coinGeckoId?: string
  ): Promise<Asset> {
    const asset = this.assetRepository.create({
      userId,
      assetGroupId,
      name,
      description,
      currentValue,
      quantity,
      currency,
      coinGeckoId: coinGeckoId || undefined
    });

    const savedAsset = await this.assetRepository.save(asset);

    // Create initial price history entry
    await this.addPriceHistory(savedAsset.id, currentValue, quantity, t(locale, 'assets.initialValue'));

    return savedAsset;
  }

  async update(
    id: number,
    userId: number,
    assetGroupId: number,
    name: string,
    description: string,
    currentValue: number,
    quantity: number,
    currency: string,
    locale: string = 'en',
    coinGeckoId?: string
  ): Promise<Asset | null> {
    const asset = await this.getById(id, userId);

    if (!asset) {
      return null;
    }

    const valueChanged = asset.currentValue !== currentValue || asset.quantity !== quantity;

    asset.assetGroupId = assetGroupId;
    asset.name = name;
    asset.description = description;
    asset.currentValue = currentValue;
    asset.quantity = quantity;
    asset.currency = currency;
    asset.coinGeckoId = coinGeckoId || undefined as any;

    const savedAsset = await this.assetRepository.save(asset);

    // Add price history if value changed
    if (valueChanged) {
      await this.addPriceHistory(id, currentValue, quantity, t(locale, 'assets.valueUpdated'));
    }

    return savedAsset;
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const result = await this.assetRepository.delete({ id, userId });
    return result.affected ? result.affected > 0 : false;
  }

  async addPriceHistory(assetId: number, value: number, quantity: number, note: string): Promise<PriceHistory> {
    const priceHistory = this.priceHistoryRepository.create({
      assetId,
      value,
      quantity,
      note
    });

    return await this.priceHistoryRepository.save(priceHistory);
  }

  async getPriceHistory(assetId: number, userId: number): Promise<PriceHistory[]> {
    // Verify asset belongs to user
    const asset = await this.getById(assetId, userId);
    if (!asset) {
      return [];
    }

    return await this.priceHistoryRepository.find({
      where: { assetId },
      order: { recordedAt: 'DESC' }
    });
  }

  async refreshCryptoPrice(assetId: number, userId: number, locale: string = 'en'): Promise<{ success: boolean; newPrice?: number }> {
    const asset = await this.getById(assetId, userId);

    if (!asset || !asset.coinGeckoId) {
      return { success: false };
    }

    const price = await this.coinGeckoService.getPrice(asset.coinGeckoId);

    if (price === null) {
      return { success: false };
    }

    const newValue = price * asset.quantity;
    const valueChanged = Math.abs(asset.currentValue - newValue) > 0.01;

    if (valueChanged) {
      asset.currentValue = newValue;
      await this.assetRepository.save(asset);
      await this.addPriceHistory(assetId, newValue, asset.quantity, t(locale, 'assets.priceRefreshed'));
    }

    return { success: true, newPrice: newValue };
  }

  async refreshAllCryptoPrices(userId: number, locale: string = 'en'): Promise<{ updated: number; failed: number }> {
    const assets = await this.assetRepository.find({
      where: { userId },
      relations: ['assetGroup']
    });

    const cryptoAssets = assets.filter(a => a.coinGeckoId && a.assetGroup?.type === 'crypto');

    if (cryptoAssets.length === 0) {
      return { updated: 0, failed: 0 };
    }

    const coinIds = [...new Set(cryptoAssets.map(a => a.coinGeckoId!))];
    const prices = await this.coinGeckoService.getPrices(coinIds);

    let updated = 0;
    let failed = 0;

    for (const asset of cryptoAssets) {
      const price = prices.get(asset.coinGeckoId!);

      if (price !== undefined) {
        const newValue = price * asset.quantity;
        const valueChanged = Math.abs(asset.currentValue - newValue) > 0.01;

        if (valueChanged) {
          asset.currentValue = newValue;
          await this.assetRepository.save(asset);
          await this.addPriceHistory(asset.id, newValue, asset.quantity, t(locale, 'assets.priceRefreshed'));
        }
        updated++;
      } else {
        failed++;
      }
    }

    return { updated, failed };
  }

  async getCryptoAssetsByUserId(userId: number): Promise<Asset[]> {
    const assets = await this.assetRepository.find({
      where: { userId },
      relations: ['assetGroup']
    });

    return assets.filter(a => a.assetGroup?.type === 'crypto');
  }
}
