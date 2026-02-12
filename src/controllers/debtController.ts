import { Request, Response } from 'express';
import { DebtService } from '../services/debtService';
import { t } from '../config/i18n';

const debtService = new DebtService();

export class DebtController {
  async index(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;
      const debts = await debtService.getAllByUserId(userId);
      const totalDebt = await debtService.getTotalDebt(userId);

      res.render('debts/index', {
        title: t(locale, 'debts.title'),
        debts,
        totalDebt,
        user: req.session,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching debts:', error);
      req.flash('error', t(locale, 'flash.loadDataError'));
      res.redirect('/dashboard');
    }
  }

  async showCreateForm(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    res.render('debts/create', {
      title: t(locale, 'debts.addNew'),
      user: req.session,
      error: req.flash('error')
    });
  }

  async create(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
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

      req.flash('success', t(locale, 'flash.debtCreateSuccess'));
      res.redirect('/debts');
    } catch (error) {
      console.error('Error creating debt:', error);
      req.flash('error', t(locale, 'flash.debtCreateError'));
      res.redirect('/debts/create');
    }
  }

  async showEditForm(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;
      const debtId = parseInt(req.params.id);

      const debt = await debtService.getById(debtId, userId);

      if (!debt) {
        req.flash('error', t(locale, 'flash.debtNotFound'));
        return res.redirect('/debts');
      }

      res.render('debts/edit', {
        title: t(locale, 'debts.editTitle'),
        debt,
        user: req.session,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error fetching debt:', error);
      req.flash('error', t(locale, 'flash.genericError'));
      res.redirect('/debts');
    }
  }

  async update(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
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
        req.flash('error', t(locale, 'flash.debtNotFound'));
        return res.redirect('/debts');
      }

      req.flash('success', t(locale, 'flash.debtUpdateSuccess'));
      res.redirect('/debts');
    } catch (error) {
      console.error('Error updating debt:', error);
      req.flash('error', t(locale, 'flash.updateError'));
      res.redirect(`/debts/${req.params.id}/edit`);
    }
  }

  async delete(req: Request, res: Response) {
    const locale = (req.session as any)?.locale || 'en';
    try {
      const userId = (req.session as any).userId;
      const debtId = parseInt(req.params.id);

      const deleted = await debtService.delete(debtId, userId);

      if (deleted) {
        req.flash('success', t(locale, 'flash.debtDeleteSuccess'));
      } else {
        req.flash('error', t(locale, 'flash.debtNotFound'));
      }

      res.redirect('/debts');
    } catch (error) {
      console.error('Error deleting debt:', error);
      req.flash('error', t(locale, 'flash.debtDeleteError'));
      res.redirect('/debts');
    }
  }
}
