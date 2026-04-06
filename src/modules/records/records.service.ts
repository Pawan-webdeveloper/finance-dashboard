import { Prisma } from '../../generated/prisma';
import prisma from '../../config/prisma';
import { NotFoundError } from '../../utils/errors';
import { getPaginationOffset } from '../../utils/pagination';
import { parseDateRange } from '../../utils/date';
import { sanitizeInput } from '../../utils/sanitize';

interface ListRecordsParams {
  page: number;
  limit: number;
  type?: 'INCOME' | 'EXPENSE';
  category?: string;
  from?: string;
  to?: string;
  search?: string;
}

export class RecordsService {
  async listRecords(params: ListRecordsParams) {
    const { page, limit, type, category, from, to, search } = params;
    const offset = getPaginationOffset(page, limit);
    const dateRange = parseDateRange(from, to);

    const where: Prisma.FinancialRecordWhereInput = {
      isDeleted: false,
    };

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (dateRange.from || dateRange.to) {
      where.date = {};
      if (dateRange.from) where.date.gte = dateRange.from;
      if (dateRange.to) where.date.lte = dateRange.to;
    }

    if (search) {
      where.OR = [
        { notes: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [records, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        skip: offset,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.financialRecord.count({ where }),
    ]);

    return { records, total };
  }

  async getRecordById(id: string) {
    const record = await prisma.financialRecord.findFirst({
      where: { id, isDeleted: false },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!record) {
      throw new NotFoundError('Financial record not found');
    }

    return record;
  }

  async createRecord(userId: string, data: {
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    date: string;
    notes?: string;
  }) {
    const record = await prisma.financialRecord.create({
      data: {
        userId,
        amount: new Prisma.Decimal(data.amount),
        type: data.type,
        category: sanitizeInput(data.category),
        date: new Date(data.date),
        notes: data.notes ? sanitizeInput(data.notes) : undefined,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return record;
  }

  async updateRecord(id: string, data: {
    amount?: number;
    type?: 'INCOME' | 'EXPENSE';
    category?: string;
    date?: string;
    notes?: string;
  }) {
    const record = await prisma.financialRecord.findFirst({
      where: { id, isDeleted: false },
    });

    if (!record) {
      throw new NotFoundError('Financial record not found');
    }

    const updateData: any = { ...data };
    if (data.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(data.amount);
    }
    if (data.date) {
      updateData.date = new Date(data.date);
    }
    if (data.category) {
      updateData.category = sanitizeInput(data.category);
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes ? sanitizeInput(data.notes) : undefined;
    }

    const updated = await prisma.financialRecord.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return updated;
  }

  async softDeleteRecord(id: string) {
    const record = await prisma.financialRecord.findFirst({
      where: { id, isDeleted: false },
    });

    if (!record) {
      throw new NotFoundError('Financial record not found');
    }

    const deleted = await prisma.financialRecord.update({
      where: { id },
      data: { isDeleted: true },
      select: { id: true, isDeleted: true },
    });

    return deleted;
  }
}

export const recordsService = new RecordsService();
