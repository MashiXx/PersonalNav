import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { UploadService } from '../services/uploadService';
import { t } from '../config/i18n';

const userService = new UserService();
const uploadService = new UploadService();

export class ProfileController {
  async showProfile(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;
      const user = await userService.getUserById(userId);

      if (!user) {
        req.flash('error', t(locale, 'flash.userNotFound'));
        return res.redirect('/dashboard');
      }

      const defaultAvatars = userService.getDefaultAvatars();

      res.render('profile/index', {
        title: t(locale, 'profile.title'),
        user: req.session,
        profile: user,
        defaultAvatars,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      req.flash('error', t(locale, 'flash.genericError'));
      res.redirect('/dashboard');
    }
  }

  async updateProfile(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;
      const { fullName, email } = req.body;

      const updated = await userService.updateProfile(userId, fullName, email);

      if (!updated) {
        req.flash('error', t(locale, 'flash.updateProfileError'));
        return res.redirect('/profile');
      }

      // Update session with new fullName
      (req.session as any).fullName = fullName;

      req.flash('success', t(locale, 'flash.profileUpdateSuccess'));
      res.redirect('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      req.flash('error', t(locale, 'flash.updateError'));
      res.redirect('/profile');
    }
  }

  async uploadAvatar(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;

      if (!req.file) {
        req.flash('error', t(locale, 'flash.selectImage'));
        return res.redirect('/profile');
      }

      const filename = await uploadService.saveAvatar(req.file, userId);
      const updated = await userService.updateAvatar(userId, filename);

      if (!updated) {
        req.flash('error', t(locale, 'flash.avatarUpdateError'));
        return res.redirect('/profile');
      }

      (req.session as any).avatar = filename;
      req.flash('success', t(locale, 'flash.avatarUpdateSuccess'));
      res.redirect('/profile');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      req.flash('error', t(locale, 'flash.avatarUploadError'));
      res.redirect('/profile');
    }
  }

  async setDefaultAvatar(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;
      const { avatar } = req.body;

      if (!avatar || !avatar.startsWith('default-')) {
        req.flash('error', t(locale, 'flash.invalidAvatar'));
        return res.redirect('/profile');
      }

      const updated = await userService.updateAvatar(userId, avatar);

      if (!updated) {
        req.flash('error', t(locale, 'flash.avatarUpdateError'));
        return res.redirect('/profile');
      }

      (req.session as any).avatar = avatar;
      req.flash('success', t(locale, 'flash.avatarUpdateSuccess'));
      res.redirect('/profile');
    } catch (error) {
      console.error('Error setting default avatar:', error);
      req.flash('error', t(locale, 'flash.genericError'));
      res.redirect('/profile');
    }
  }
}
