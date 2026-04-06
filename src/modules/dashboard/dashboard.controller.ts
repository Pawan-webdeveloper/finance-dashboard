import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { sendSuccess } from '../../utils/response';

export class DashboardController {
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { from, to } = req.query as any;
      const summary = await dashboardService.getSummary(from, to);
      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }

  async getByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { from, to } = req.query as any;
      const categories = await dashboardService.getByCategory(from, to);
      sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  }

  async getTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { granularity = 'monthly', from, to } = req.query as any;
      const trends = await dashboardService.getTrends(granularity, from, to);
      sendSuccess(res, trends);
    } catch (error) {
      next(error);
    }
  }

  async getRecentRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit = 10 } = req.query as any;
      const records = await dashboardService.getRecentRecords(Number(limit));
      sendSuccess(res, records);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
