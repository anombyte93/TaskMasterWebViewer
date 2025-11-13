import type { Request, Response, NextFunction } from 'express';

/**
 * ANSI color codes for terminal output
 */
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

/**
 * Get color based on HTTP status code
 */
function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return colors.green;
  if (status >= 400 && status < 500) return colors.yellow;
  if (status >= 500) return colors.red;
  return colors.reset;
}

/**
 * Format timestamp as [YYYY-MM-DD HH:MM:SS]
 */
function formatTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}]`;
}

/**
 * Request logging middleware with timing
 * Logs incoming requests and response status with duration
 *
 * Usage: app.use(requestLogger) - Register before routes
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();
  const timestamp = formatTimestamp();

  // Log incoming request
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';

  console.log(
    `${colors.gray}${timestamp}${colors.reset} ${colors.blue}${req.method}${colors.reset} ${req.path} - ${colors.gray}${ip}${colors.reset}`
  );

  // Log detailed info in development mode
  if (process.env.NODE_ENV === 'development' && userAgent !== 'unknown') {
    console.log(`${colors.gray}  User-Agent: ${userAgent}${colors.reset}`);
  }

  // Track response completion
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusColor = getStatusColor(res.statusCode);

    // Format log line: [timestamp] METHOD /path STATUS duration
    const logLine = [
      `${colors.gray}${timestamp}${colors.reset}`,
      `${colors.blue}${req.method}${colors.reset}`,
      req.path,
      `${statusColor}${res.statusCode}${colors.reset}`,
      `${colors.gray}${duration}ms${colors.reset}`,
    ].join(' ');

    console.log(logLine);
  });

  next();
}
