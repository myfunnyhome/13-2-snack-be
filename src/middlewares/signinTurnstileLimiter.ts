import type { NextFunction, Request, Response } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

function getSigninEmail(req: Request): string {
  const email: unknown = req.body?.email;
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

const signinFailureOptions = {
  windowMs: 15 * 60 * 1000,
  skipSuccessfulRequests: true,
  requestWasSuccessful: (_req: Request, res: Response) =>
    res.statusCode !== 401,
  handler: (_req: Request, res: Response, next: NextFunction) => {
    res.locals.turnstileRequired = true;
    next();
  },
  legacyHeaders: false,
};

export const signinEmailIpLimiter = rateLimit({
  ...signinFailureOptions,
  limit: 3,
  keyGenerator: (req) =>
    `${getSigninEmail(req)}:${ipKeyGenerator(req.ip ?? '')}`,
});

export const signinEmailLimiter = rateLimit({
  ...signinFailureOptions,
  limit: 5,
  keyGenerator: getSigninEmail,
});
