import rateLimit from 'express-rate-limit';

// Snacky 비용 남용 방지용
export const snackyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) => String(req.auth!.userId),
  message: {
    success: false,
    message: 'Snacky 질문이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    code: 'TOO_MANY_REQUESTS',
  },
});
