import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { UploadService } from '../services/uploadService';

const userService = new UserService();
const uploadService = new UploadService();

export class ProfileController {
  async showProfile(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const user = await userService.getUserById(userId);

      if (!user) {
        req.flash('error', 'Không tìm thấy thông tin người dùng');
        return res.redirect('/dashboard');
      }

      const defaultAvatars = userService.getDefaultAvatars();

      res.render('profile/index', {
        title: 'Thông tin cá nhân',
        user: req.session,
        profile: user,
        defaultAvatars,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      req.flash('error', 'Có lỗi xảy ra');
      res.redirect('/dashboard');
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const { fullName, email } = req.body;

      const updated = await userService.updateProfile(userId, fullName, email);

      if (!updated) {
        req.flash('error', 'Không thể cập nhật thông tin');
        return res.redirect('/profile');
      }

      // Update session with new fullName
      (req.session as any).fullName = fullName;

      req.flash('success', 'Cập nhật thông tin thành công');
      res.redirect('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      req.flash('error', 'Có lỗi xảy ra khi cập nhật');
      res.redirect('/profile');
    }
  }

  async uploadAvatar(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;

      if (!req.file) {
        req.flash('error', 'Vui lòng chọn file ảnh');
        return res.redirect('/profile');
      }

      const filename = await uploadService.saveAvatar(req.file, userId);
      const updated = await userService.updateAvatar(userId, filename);

      if (!updated) {
        req.flash('error', 'Không thể cập nhật avatar');
        return res.redirect('/profile');
      }

      (req.session as any).avatar = filename;
      req.flash('success', 'Cập nhật avatar thành công');
      res.redirect('/profile');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      req.flash('error', 'Có lỗi xảy ra khi upload avatar');
      res.redirect('/profile');
    }
  }

  async setDefaultAvatar(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const { avatar } = req.body;

      if (!avatar || !avatar.startsWith('default-')) {
        req.flash('error', 'Avatar không hợp lệ');
        return res.redirect('/profile');
      }

      const updated = await userService.updateAvatar(userId, avatar);

      if (!updated) {
        req.flash('error', 'Không thể cập nhật avatar');
        return res.redirect('/profile');
      }

      (req.session as any).avatar = avatar;
      req.flash('success', 'Cập nhật avatar thành công');
      res.redirect('/profile');
    } catch (error) {
      console.error('Error setting default avatar:', error);
      req.flash('error', 'Có lỗi xảy ra');
      res.redirect('/profile');
    }
  }
}
