import { AppDataSource } from '../config/database';
import { Debt } from '../models/Debt';
import { convertToVND } from '../config/currencies';

export class DebtService {
  private debtRepository = AppDataSource.getRepository(Debt);

  async getAllByUserId(userId: number): Promise<Debt[]> {
    return await this.debtRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  async getById(id: number, userId: number): Promise<Debt | null> {
    return await this.debtRepository.findOne({
      where: { id, userId }
    });
  }

  async create(
    userId: number,
    name: string,
    description: string,
    amount: number,
    interestRate: number,
    currency: string,
    dueDate: Date | null,
    status: string
  ): Promise<Debt> {
    const debt = this.debtRepository.create({
      userId,
      name,
      description,
      amount,
      interestRate,
      currency,
      dueDate: dueDate || undefined,
      status
    });

    return await this.debtRepository.save(debt);
  }

  async update(
    id: number,
    userId: number,
    name: string,
    description: string,
    amount: number,
    interestRate: number,
    currency: string,
    dueDate: Date | null,
    status: string
  ): Promise<Debt | null> {
    const debt = await this.getById(id, userId);

    if (!debt) {
      return null;
    }

    debt.name = name;
    debt.description = description;
    debt.amount = amount;
    debt.interestRate = interestRate;
    debt.currency = currency;
    debt.dueDate = dueDate;
    debt.status = status;

    return await this.debtRepository.save(debt);
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const result = await this.debtRepository.delete({ id, userId });
    return result.affected ? result.affected > 0 : false;
  }

  async getTotalDebt(userId: number): Promise<number> {
    const debts = await this.getAllByUserId(userId);
    return debts
      .filter(debt => debt.status === 'active')
      .reduce((sum, debt) => sum + convertToVND(Number(debt.amount), debt.currency), 0);
  }
}
