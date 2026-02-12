import { Request, Response } from 'express';
import { DebtService } from '../services/debtService';

const debtService = new DebtService();

export class DebtController {
  async index(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const debts = await debtService.getAllByUserId(userId);
      const totalDebt = await debtService.getTotalDebt(userId);

      res.render('debts/index', {
        title: 'Quản lý khoản nợ',
        debts,
        totalDebt,
        user: req.session,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching debts:', error);
      req.flash('error', 'Có lỗi xảy ra khi tải dữ liệu');
      res.redirect('/dashboard');
    }
  }

  async showCreateForm(req: Request, res: Response) {
    res.render('debts/create', {
      title: 'Thêm khoản nợ mới',
      user: req.session,
      error: req.flash('error')
    });
  }

  async create(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const { name, description, amount, interestRate, currency, dueDate, status } = req.body;

      await debtService.create(
        userId,
        name,
        description,
        parseFloat(amount),
        parseFloat(interestRate || 0),
        currency,
        dueDate ? new Date(dueDate) : null,
        status
      );

      req.flash('success', 'Thêm khoản nợ thành công');
      res.redirect('/debts');
    } catch (error) {
      console.error('Error creating debt:', error);
      req.flash('error', 'Có lỗi xảy ra khi thêm khoản nợ');
      res.redirect('/debts/create');
    }
  }

  async showEditForm(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const debtId = parseInt(req.params.id);

      const debt = await debtService.getById(debtId, userId);

      if (!debt) {
        req.flash('error', 'Không tìm thấy khoản nợ');
        return res.redirect('/debts');
      }

      res.render('debts/edit', {
        title: 'Chỉnh sửa khoản nợ',
        debt,
        user: req.session,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching debt:', error);
      req.flash('error', 'Có lỗi xảy ra');
      res.redirect('/debts');
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const debtId = parseInt(req.params.id);
      const { name, description, amount, interestRate, currency, dueDate, status } = req.body;

      const updated = await debtService.update(
        debtId,
        userId,
        name,
        description,
        parseFloat(amount),
        parseFloat(interestRate || 0),
        currency,
        dueDate ? new Date(dueDate) : null,
        status
      );

      if (!updated) {
        req.flash('error', 'Không tìm thấy khoản nợ');
        return res.redirect('/debts');
      }

      req.flash('success', 'Cập nhật khoản nợ thành công');
      res.redirect('/debts');
    } catch (error) {
      console.error('Error updating debt:', error);
      req.flash('error', 'Có lỗi xảy ra khi cập nhật');
      res.redirect(`/debts/${req.params.id}/edit`);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const debtId = parseInt(req.params.id);

      const deleted = await debtService.delete(debtId, userId);

      if (deleted) {
        req.flash('success', 'Xóa khoản nợ thành công');
      } else {
        req.flash('error', 'Không tìm thấy khoản nợ');
      }

      res.redirect('/debts');
    } catch (error) {
      console.error('Error deleting debt:', error);
      req.flash('error', 'Có lỗi xảy ra khi xóa');
      res.redirect('/debts');
    }
  }
}
