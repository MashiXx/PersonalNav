import { Request, Response, NextFunction } from 'express';
import { t } from '../config/i18n';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    fullName: string;
    email: string;
  };
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && (req.session as any).userId) {
    return next();
  }
  const locale = (req.session as any)?.locale || 'en';
  req.flash('error', t(locale, 'flash.loginRequired'));
  res.redirect('/auth/login');
};

export const redirectIfAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && (req.session as any).userId) {
    return res.redirect('/dashboard');
  }
  next();
};
