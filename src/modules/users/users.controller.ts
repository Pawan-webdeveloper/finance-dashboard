import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';

export class UsersController {
  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query as any;
      const { users, total } = await usersService.listUsers(page || 1, limit || 20);
      sendPaginated(res, users, total, page || 1, limit || 20);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.getUserById(req.params.id as string);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.createUser(req.body);
      sendCreated(res, user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.updateUser(req.params.id as string, req.body);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.deactivateUser(req.params.id as string);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
