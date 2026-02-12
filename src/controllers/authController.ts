import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { t } from '../config/i18n';

const authService = new AuthService();

export class AuthController {
  async showLoginPage(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    res.render('auth/login', {
      title: t(locale, 'auth.login'),
      error: req.flash('error'),
      success: req.flash('success')
    });
  }

  async showRegisterPage(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    res.render('auth/register', {
      title: t(locale, 'auth.register'),
      error: req.flash('error')
    });
  }

  async login(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const { username, password, rememberMe } = req.body;

      const user = await authService.login(username, password);

      if (!user) {
        req.flash('error', t(locale, 'flash.invalidCredentials'));
        return res.redirect('/auth/login');
      }

      (req.session as any).userId = user.id;
      (req.session as any).username = user.username;
      (req.session as any).fullName = user.fullName;
      (req.session as any).avatar = user.avatar;

      // Set cookie expiry based on "Remember Me"
      if (rememberMe === 'true') {
        // Remember for 30 days
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
      } else {
        // Session only (browser close)
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
      }

      res.redirect('/dashboard');
    } catch (error) {
      req.flash('error', t(locale, 'flash.genericError'));
      res.redirect('/auth/login');
    }
  }

  async register(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const { username, password, confirmPassword, fullName, email } = req.body;

      if (password !== confirmPassword) {
        req.flash('error', t(locale, 'flash.passwordMismatch'));
        return res.redirect('/auth/register');
      }

      await authService.register(username, password, fullName, email);

      req.flash('success', t(locale, 'flash.registerSuccess'));
      res.redirect('/auth/login');
    } catch (error: any) {
      req.flash('error', t(locale, error.message));
      res.redirect('/auth/register');
    }
  }

  async logout(req: Request, res: Response) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/auth/login');
    });
  }
}
