import { Request, Response, NextFunction } from 'express';

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
  req.flash('error', 'Vui lòng đăng nhập để tiếp tục');
  res.redirect('/auth/login');
};

export const redirectIfAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && (req.session as any).userId) {
    return res.redirect('/dashboard');
  }
  next();
};
