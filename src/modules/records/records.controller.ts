import { Request, Response, NextFunction } from 'express';
import { recordsService } from './records.service';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';

export class RecordsController {
  async listRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, type, category, from, to, search } = req.query as any;
      const { records, total } = await recordsService.listRecords({
        page: Number(page),
        limit: Number(limit),
        type,
        category,
        from,
        to,
        search,
      });
      sendPaginated(res, records, total, Number(page), Number(limit));
    } catch (error) {
      next(error);
    }
  }

  async getRecordById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await recordsService.getRecordById(req.params.id as string);
      sendSuccess(res, record);
    } catch (error) {
      next(error);
    }
  }

  async createRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await recordsService.createRecord(req.user!.userId, req.body);
      sendCreated(res, record);
    } catch (error) {
      next(error);
    }
  }

  async updateRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await recordsService.updateRecord(req.params.id as string, req.body);
      sendSuccess(res, record);
    } catch (error) {
      next(error);
    }
  }

  async deleteRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await recordsService.softDeleteRecord(req.params.id as string);
      sendSuccess(res, record);
    } catch (error) {
      next(error);
    }
  }
}

export const recordsController = new RecordsController();
