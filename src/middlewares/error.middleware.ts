import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { env } from '../config/env';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  // Handle Zod validation errors (via validate middleware)
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      details: err.details,
    });
    return;
  }

  // Handle custom AppError instances
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  // In development, include stack trace
  const response: any = {
    success: false,
    error: 'Internal Server Error',
  };

  if (env.NODE_ENV === 'development') {
    response.message = err.message;
    response.stack = err.stack;
  }

  res.status(500).json(response);
}
