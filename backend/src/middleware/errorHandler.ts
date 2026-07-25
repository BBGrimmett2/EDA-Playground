/**
 * Error Handler Middleware
 */

import type { Request, Response, NextFunction } from 'express';
import type { ErrorResponse } from '../types/integration';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  const response: ErrorResponse = {
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };

  res.status(500).json(response);
};
