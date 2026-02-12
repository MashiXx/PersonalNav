import { AppDataSource } from '../config/database';
import { Asset } from '../models/Asset';
import { PriceHistory } from '../models/PriceHistory';
import { t } from '../config/i18n';

export class AssetService {
  private assetRepository = AppDataSource.getRepository(Asset);
  private priceHistoryRepository = AppDataSource.getRepository(PriceHistory);

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
    locale: string = 'en'
  ): Promise<Asset> {
    const asset = this.assetRepository.create({
      userId,
      assetGroupId,
      name,
      description,
      currentValue,
      quantity,
      currency
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
    locale: string = 'en'
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
}
