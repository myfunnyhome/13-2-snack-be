import type { Role } from '../generated/prisma/client';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: number;
        role: Role;
        organizationId: number;
        // JWT 서명 시 access/refresh 구분을 위해 넣는 값(utils/authToken.ts).
        // 검증 미들웨어(auth.middleware.ts)에서 시크릿이 다른 것만으로 구분하고
        // 이 값을 확인하지 않으면, 두 시크릿이 실수로 같아지는 사고에 무방비해짐.
        // 그래서 타입에도 명시해서 검증 로직에서 사용할 수 있게 함.
        type: 'access' | 'refresh';
      };
    }
  }
}
