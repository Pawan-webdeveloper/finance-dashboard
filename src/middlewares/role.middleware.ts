import { Request, Response, NextFunction } from 'express';
import { Role } from '../generated/prisma';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

/**
 * Factory function that returns middleware to check if the authenticated user
 * has one of the allowed roles.
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }

    next();
  };
}
