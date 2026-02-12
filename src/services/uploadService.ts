import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('flash.imageOnly'));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export class UploadService {
  // Process and save avatar
  async saveAvatar(file: Express.Multer.File, userId: number): Promise<string> {
    const filename = `avatar-${userId}-${Date.now()}.png`;
    const uploadPath = path.join(__dirname, '../public/uploads/avatars', filename);

    try {
      // Process image: resize to 128x128 and save
      await sharp(file.buffer)
        .resize(128, 128, {
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toFile(uploadPath);

      return filename;
    } catch (error) {
      console.error('Error processing avatar:', error);
      throw new Error('flash.avatarProcessError');
    }
  }

  // Delete old avatar file
  async deleteFile(filename: string, type: 'avatar' | 'icon'): Promise<void> {
    const folder = type === 'avatar' ? 'avatars' : 'icons';
    const filePath = path.join(__dirname, '../public/uploads', folder, filename);

    try {
      if (fs.existsSync(filePath) && !filename.startsWith('default-')) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  // Get list of default avatars
  getDefaultAvatars(): string[] {
    return Array.from({ length: 12 }, (_, i) => `default-${i + 1}.svg`);
  }

  // Get list of default icons — labels are translation keys
  getDefaultIcons(): { key: string; file: string; label: string }[] {
    return [
      { key: 'real_estate', file: 'real_estate.svg', label: 'icons.realEstate' },
      { key: 'savings', file: 'savings.svg', label: 'icons.savings' },
      { key: 'stocks', file: 'stocks.svg', label: 'icons.stocks' },
      { key: 'crypto', file: 'crypto.svg', label: 'icons.crypto' },
      { key: 'gold', file: 'gold.svg', label: 'icons.gold' },
      { key: 'car', file: 'car.svg', label: 'icons.car' },
      { key: 'jewelry', file: 'jewelry.svg', label: 'icons.jewelry' },
      { key: 'art', file: 'art.svg', label: 'icons.art' },
      { key: 'electronics', file: 'electronics.svg', label: 'icons.electronics' },
      { key: 'other', file: 'other.svg', label: 'icons.other' }
    ];
  }
}
