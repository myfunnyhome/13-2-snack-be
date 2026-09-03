import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../types/errors';

/*
@ 전역 에러 핸들러
- 서비스 레이어에서 throw한 에러를 응답 형식 컨벤션으로 변환한다.
  성공 { success: true, data } / 실패 { success: false, message, code }
- app.ts에서 라우터·404 핸들러 다음, 항상 마지막에 등록한다.
@ 주의사항
- Prisma 에러 분기(P2002 / P2003 / P2025)는 아직 없다.
  schema.prisma에 모델이 없어 `prisma generate` 전이고,
  생성물 경로(루트 generated/)는 .gitignore 대상이라
  이 브랜치를 받은 사람이 컴파일할 수 없다.
- 스키마가 dev에 머지된 뒤 별도 이슈에서 추가한다.
  이때 import 경로는 `../../generated/prisma/client`
  (schema.prisma의 generator output = "../generated/prisma" 기준)
*/

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // 이미 응답이 전송되기 시작했다면 중복 응답을 막고 Express 기본 핸들러에 위임
  if (res.headersSent) {
    return next(err);
  }

  // 1) 우리가 만든 커스텀 에러
  // instanceof로 "우리 에러"만 정확히 걸러낸다.
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  // 2) Zod 유효성 검사 실패
  // 서비스 로직의 BadRequest와 "스키마 검증 실패"를 응답만 보고 구분하기 위해
  // 상태코드는 400이지만 code는 VALIDATION_ERROR로 분리한다.
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: err.issues[0]?.message ?? '입력값이 유효하지 않습니다.',
      code: 'VALIDATION_ERROR',
    });
  }

  // 3) 예상 못 한 모든 에러 (최후의 보루)
  // 상세 원인은 서버 로그에만, 사용자에겐 일반 메시지만 노출
  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    message: '서버 에러가 발생했습니다.',
    code: 'INTERNAL_SERVER_ERROR',
  });
};

export default errorHandler;
