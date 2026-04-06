import { Response } from 'express';

interface SuccessResponse {
  success: true;
  data: any;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: any;
}

export function sendSuccess(res: Response, data: any, statusCode = 200, meta?: SuccessResponse['meta']): void {
  const response: SuccessResponse = { success: true, data };
  if (meta) response.meta = meta;
  res.status(statusCode).json(response);
}

export function sendError(res: Response, error: string, statusCode = 500, message?: string, details?: any): void {
  const response: ErrorResponse = { success: false, error };
  if (message) response.message = message;
  if (details) response.details = details;
  res.status(statusCode).json(response);
}

export function sendCreated(res: Response, data: any): void {
  sendSuccess(res, data, 201);
}

export function sendPaginated(res: Response, data: any[], total: number, page: number, limit: number): void {
  sendSuccess(res, data, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}
