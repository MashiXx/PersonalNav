import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import path from 'path';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import { getCurrencies, convertToVND, formatByCurrency } from './config/currencies';

// Import routes
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import assetGroupRoutes from './routes/assetGroupRoutes';
import assetRoutes from './routes/assetRoutes';
import debtRoutes from './routes/debtRoutes';
import profileRoutes from './routes/profileRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }) as any
);

app.use(flash() as any);

// Global variables for views
app.use((req, res, next) => {
  res.locals.formatCurrency = (value: number, currencyCode?: string) => {
    return formatByCurrency(value, currencyCode || 'VND');
  };

  res.locals.currencies = getCurrencies();
  res.locals.convertToVND = convertToVND;

  res.locals.formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  res.locals.avatarPath = (avatar: string) => {
    if (avatar && !avatar.startsWith('default-')) {
      return `/uploads/avatars/${avatar}`;
    }
    return `/images/avatars/${avatar || 'default-1.svg'}`;
  };

  next();
});

// Routes
app.get('/', (req, res) => {
  if (req.session && (req.session as any).userId) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/auth/login');
  }
});

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/asset-groups', assetGroupRoutes);
app.use('/assets', assetRoutes);
app.use('/debts', debtRoutes);
app.use('/profile', profileRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Không tìm thấy trang',
    message: 'Trang bạn đang tìm không tồn tại',
    user: req.session
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).render('error', {
    title: 'Lỗi',
    message: err.message || 'Có lỗi xảy ra',
    user: req.session
  });
});

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`✓ Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
