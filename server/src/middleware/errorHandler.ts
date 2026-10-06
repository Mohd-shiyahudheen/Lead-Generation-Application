import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: Array<{ field: string; message: string }>;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const code = err.code || (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR');
  const message = err.message || 'An unexpected error occurred';

  console.error(`[Error] ${req.method} ${req.path}:`, err);

  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(err.details ? { details: err.details } : {}),
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    },
  });
};
