import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
) {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    statusCode,
    isOperational,
  });

  res.status(statusCode).json({
    error: {
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}
