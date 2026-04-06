import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

/**
 * Middleware factory that validates request body/query against a Zod schema.
 */
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const error = result.error;
      const details = (error as any).issues
        ? (error as any).issues.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          }))
        : [{ field: 'unknown', message: error.message }];
      next(new ValidationError('Validation failed', details));
    } else {
      // Replace with parsed (and coerced) data
      req[source] = result.data;
      next();
    }
  };
}

