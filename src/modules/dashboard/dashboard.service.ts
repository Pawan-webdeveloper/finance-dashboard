import { Prisma } from '../../generated/prisma';
import prisma from '../../config/prisma';
import { parseDateRange } from '../../utils/date';

export class DashboardService {
  /**
   * Total income, expenses, and net balance.
   */
  async getSummary(from?: string, to?: string) {
    const dateRange = parseDateRange(from, to);

    const where: Prisma.FinancialRecordWhereInput = {
      isDeleted: false,
    };

    if (dateRange.from || dateRange.to) {
      where.date = {};
      if (dateRange.from) where.date.gte = dateRange.from;
      if (dateRange.to) where.date.lte = dateRange.to;
    }

    const [incomeResult, expenseResult, recordCount] = await Promise.all([
      prisma.financialRecord.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
      }),
      prisma.financialRecord.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
      prisma.financialRecord.count({ where }),
    ]);

    const totalIncome = Number(incomeResult._sum.amount || 0);
    const totalExpense = Number(expenseResult._sum.amount || 0);
    const netBalance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      netBalance,
      totalRecords: recordCount,
    };
  }

  /**
   * Totals grouped by category.
   */
  async getByCategory(from?: string, to?: string) {
    const dateRange = parseDateRange(from, to);

    const where: Prisma.FinancialRecordWhereInput = {
      isDeleted: false,
    };

    if (dateRange.from || dateRange.to) {
      where.date = {};
      if (dateRange.from) where.date.gte = dateRange.from;
      if (dateRange.to) where.date.lte = dateRange.to;
    }

    const results = await prisma.financialRecord.groupBy({
      by: ['category', 'type'],
      where,
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
    });

    // Transform into a more usable structure
    const categoryMap: Record<string, { income: number; expense: number; net: number; count: number }> = {};

    for (const row of results) {
      const cat = row.category.toLowerCase();
      if (!categoryMap[cat]) {
        categoryMap[cat] = { income: 0, expense: 0, net: 0, count: 0 };
      }
      const amount = Number(row._sum.amount || 0);
      categoryMap[cat].count += row._count;
      if (row.type === 'INCOME') {
        categoryMap[cat].income += amount;
      } else {
        categoryMap[cat].expense += amount;
      }
      categoryMap[cat].net = categoryMap[cat].income - categoryMap[cat].expense;
    }

    const categories = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      ...data,
    }));

    return categories;
  }

  /**
   * Monthly or weekly breakdown.
   */
  async getTrends(granularity: 'weekly' | 'monthly' = 'monthly', from?: string, to?: string) {
    const dateRange = parseDateRange(from, to);

    const where: Prisma.FinancialRecordWhereInput = {
      isDeleted: false,
    };

    if (dateRange.from || dateRange.to) {
      where.date = {};
      if (dateRange.from) where.date.gte = dateRange.from;
      if (dateRange.to) where.date.lte = dateRange.to;
    }

    const records = await prisma.financialRecord.findMany({
      where,
      select: { amount: true, type: true, date: true },
      orderBy: { date: 'asc' },
    });

    // Group by time period
    const periodMap: Record<string, { income: number; expense: number; net: number }> = {};

    for (const record of records) {
      const date = new Date(record.date);
      let key: string;

      if (granularity === 'monthly') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        // Weekly: use ISO week
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const weekNum = Math.ceil((((date.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7);
        key = `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
      }

      if (!periodMap[key]) {
        periodMap[key] = { income: 0, expense: 0, net: 0 };
      }

      const amount = Number(record.amount);
      if (record.type === 'INCOME') {
        periodMap[key].income += amount;
      } else {
        periodMap[key].expense += amount;
      }
      periodMap[key].net = periodMap[key].income - periodMap[key].expense;
    }

    const trends = Object.entries(periodMap).map(([period, data]) => ({
      period,
      ...data,
    }));

    return trends;
  }

  /**
   * Last N records.
   */
  async getRecentRecords(limit = 10) {
    const records = await prisma.financialRecord.findMany({
      where: { isDeleted: false },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return records;
  }
}

export const dashboardService = new DashboardService();
