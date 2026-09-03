// 커스텀 에러 — 서비스 레이어에서 throw하면 errorHandler가 받아 처리한다.
// code 필드로 프론트가 에러 종류를 분기한다.

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message = '잘못된 요청입니다.') {
    super(message, 400, 'BAD_REQUEST');
  }
}

// code를 선택적으로 받아 토큰 만료(TOKEN_EXPIRED) 등을 구분한다.
export class UnauthorizedError extends AppError {
  constructor(message = '로그인이 필요합니다.', code = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = '권한이 없습니다.') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = '요청한 리소스를 찾을 수 없습니다.') {
    super(message, 404, 'NOT_FOUND');
  }
}

// 비즈니스 규칙 위반으로 인한 충돌
// (예산 초과, 이미 처리된 구매 요청, 중복 상품 등록 등)
// DB 제약 위반(Prisma P2002)과 달리 서비스 레이어에서 직접 던진다.
export class ConflictError extends AppError {
  constructor(message = '요청을 처리할 수 없는 상태입니다.') {
    super(message, 409, 'CONFLICT');
  }
}
