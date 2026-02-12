import { Request } from 'express';

declare global {
  namespace Express {
    interface Locals {
      formatCurrency: (value: number) => string;
      formatDate: (date: Date) => string;
    }
  }
}
