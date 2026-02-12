import { AppDataSource } from '../config/database';
import { AssetGroup } from '../models/AssetGroup';
import { Asset } from '../models/Asset';
import { convertToVND } from '../config/currencies';

export class AssetGroupService {
  private assetGroupRepository = AppDataSource.getRepository(AssetGroup);

  async getAllByUserId(userId: number): Promise<AssetGroup[]> {
    return await this.assetGroupRepository.find({
      where: { userId },
      relations: ['assets'],
      order: { createdAt: 'DESC' }
    });
  }

  async getById(id: number, userId: number): Promise<AssetGroup | null> {
    return await this.assetGroupRepository.findOne({
      where: { id, userId },
      relations: ['assets']
    });
  }

  async getByIdWithHistory(id: number, userId: number): Promise<AssetGroup | null> {
    return await this.assetGroupRepository.findOne({
      where: { id, userId },
      relations: ['assets', 'assets.priceHistory']
    });
  }

  async create(userId: number, name: string, description: string, type: string, icon?: string, currency?: string): Promise<AssetGroup> {
    const assetGroup = this.assetGroupRepository.create({
      userId,
      name,
      description,
      type,
      icon: icon || 'other.svg',
      currency: currency || 'VND'
    });

    return await this.assetGroupRepository.save(assetGroup);
  }

  async update(id: number, userId: number, name: string, description: string, type: string, icon?: string, currency?: string): Promise<AssetGroup | null> {
    const assetGroup = await this.getById(id, userId);

    if (!assetGroup) {
      return null;
    }

    assetGroup.name = name;
    assetGroup.description = description;
    assetGroup.type = type;
    if (icon) {
      assetGroup.icon = icon;
    }
    if (currency && currency !== assetGroup.currency) {
      assetGroup.currency = currency;

      if (assetGroup.assets && assetGroup.assets.length > 0) {
        const assetRepository = AppDataSource.getRepository(Asset);
        for (const asset of assetGroup.assets) {
          asset.currency = currency;
        }
        await assetRepository.save(assetGroup.assets);
      }
    }

    return await this.assetGroupRepository.save(assetGroup);
  }

  async delete(id: number, userId: number): Promise<{ success: boolean; message?: string }> {
    // Check if the group has any assets
    const assetGroup = await this.getById(id, userId);

    if (!assetGroup) {
      return { success: false, message: 'flash.assetGroupNotFound' };
    }

    if (assetGroup.assets && assetGroup.assets.length > 0) {
      return { success: false, message: 'flash.assetGroupHasData' };
    }

    const result = await this.assetGroupRepository.delete({ id, userId });
    return {
      success: result.affected ? result.affected > 0 : false,
      message: result.affected && result.affected > 0 ? 'flash.deleteSuccess' : 'flash.deleteFailed'
    };
  }

  async getTotalValueByGroup(userId: number): Promise<any[]> {
    const groups = await this.getAllByUserId(userId);

    return groups.map(group => {
      const totalValue = group.assets.reduce((sum, asset) => sum + convertToVND(Number(asset.currentValue), asset.currency), 0);
      return {
        id: group.id,
        name: group.name,
        type: group.type,
        icon: group.icon,
        currency: group.currency,
        totalValue,
        assetCount: group.assets.length
      };
    });
  }
}
