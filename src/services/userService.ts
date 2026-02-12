import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { UploadService } from './uploadService';

const uploadService = new UploadService();

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async getUserById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async updateAvatar(userId: number, avatar: string): Promise<User | null> {
    const user = await this.getUserById(userId);

    if (!user) {
      return null;
    }

    // Delete old avatar if it's not a default one
    if (user.avatar && !user.avatar.startsWith('default-')) {
      await uploadService.deleteFile(user.avatar, 'avatar');
    }

    user.avatar = avatar;
    return await this.userRepository.save(user);
  }

  async updateProfile(userId: number, fullName: string, email: string): Promise<User | null> {
    const user = await this.getUserById(userId);

    if (!user) {
      return null;
    }

    user.fullName = fullName;
    user.email = email;

    return await this.userRepository.save(user);
  }

  getDefaultAvatars(): string[] {
    return uploadService.getDefaultAvatars();
  }
}
