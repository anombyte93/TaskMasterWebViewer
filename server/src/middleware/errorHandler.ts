import type { Request, Response, NextFunction } from 'express';

/**
 * Centralized error handling middleware
 * Extracts status codes, logs errors, and returns formatted JSON responses
 *
 * Usage: app.use(errorHandler) - Must be registered AFTER all routes
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Extract status code from various error formats
  const status = err.status || err.statusCode || 500;

  // Extract error message
  const message = err.message || 'Internal Server Error';

  // Log error with stack trace for debugging
  console.error('[Error Handler]', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    status,
    message,
    stack: err.stack,
    // Include additional error properties if present
    ...(err.code && { code: err.code }),
    ...(err.name && { name: err.name }),
  });

  // Build response payload
  const responsePayload: any = {
    message,
    status,
  };

  // Include stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    responsePayload.stack = err.stack;

    // Include any additional error details
    if (err.details) {
      responsePayload.details = err.details;
    }
  }

  // Send JSON response
  res.status(status).json(responsePayload);
}
