import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

const authService = new AuthService();

export class AuthController {
  async showLoginPage(req: Request, res: Response) {
    res.render('auth/login', {
      title: 'Đăng nhập',
      error: req.flash('error'),
      success: req.flash('success')
    });
  }

  async showRegisterPage(req: Request, res: Response) {
    res.render('auth/register', {
      title: 'Đăng ký',
      error: req.flash('error')
    });
  }

  async login(req: Request, res: Response) {
    try {
      const { username, password, rememberMe } = req.body;

      const user = await authService.login(username, password);

      if (!user) {
        req.flash('error', 'Tên đăng nhập hoặc mật khẩu không đúng');
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
      req.flash('error', 'Đã xảy ra lỗi. Vui lòng thử lại');
      res.redirect('/auth/login');
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { username, password, confirmPassword, fullName, email } = req.body;

      if (password !== confirmPassword) {
        req.flash('error', 'Mật khẩu xác nhận không khớp');
        return res.redirect('/auth/register');
      }

      await authService.register(username, password, fullName, email);

      req.flash('success', 'Đăng ký thành công. Vui lòng đăng nhập');
      res.redirect('/auth/login');
    } catch (error: any) {
      req.flash('error', error.message);
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
