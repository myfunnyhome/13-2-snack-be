import swaggerJSDoc from 'swagger-jsdoc';

const isProduction = process.env.NODE_ENV === 'production';

const errorContent = {
  'application/json': {
    schema: { $ref: '#/components/schemas/ErrorResponse' },
  },
};

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '간식대장(SNACK) API',
      version: '1.0.0',
      description:
        '여러 플랫폼에서 구매하는 간식을 한 곳에서 관리하는 구매 요청·승인 서비스 API.\n\n' +
        'GET을 제외한 모든 변경 요청(POST/PATCH/DELETE)은 X-CSRF-Protection: 1 헤더가 필요하며, ' +
        '없으면 403(CSRF_REJECTED)을 반환합니다. Authorize에서 csrfHeader 값을 1로 입력하세요.',
    },
    servers: [
      {
        url:
          process.env.SWAGGER_SERVER_URL ??
          `http://localhost:${process.env.PORT ?? 3000}`,
      },
    ],
    // 기본은 accessToken 쿠키 인증 + CSRF 헤더. 인증이 필요 없는 엔드포인트는 문서에서 덮어쓴다.
    // (조회 전용이면 security: [], 인증 없는 변경 요청이면 csrfHeader만)
    security: [{ cookieAuth: [], csrfHeader: [] }],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description: '로그인 시 HttpOnly 쿠키로 발급되는 accessToken',
        },
        refreshCookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken',
          description: '로그인 시 HttpOnly 쿠키로 발급되는 refreshToken',
        },
        csrfHeader: {
          type: 'apiKey',
          in: 'header',
          name: 'X-CSRF-Protection',
          description:
            'GET을 제외한 변경 요청에 필수. 값은 1 (없으면 403 CSRF_REJECTED)',
        },
      },
      schemas: {
        // 공통 성공 응답 래퍼. data는 엔드포인트별 실제 타입으로 덮어쓴다.
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              nullable: true,
              description: '엔드포인트별 실제 데이터 (없으면 생략)',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: {
              type: 'string',
              example: '유효하지 않은 인증 정보입니다.',
            },
            code: { type: 'string', example: 'UNAUTHORIZED' },
          },
        },
        // express-rate-limit이 직접 만드는 429 응답. 공통 에러 컨벤션과 달리 code 필드가 없다.
        RateLimitResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: {
              type: 'string',
              example:
                '로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.',
            },
          },
        },
        Role: {
          type: 'string',
          enum: ['GENERAL', 'ADMIN', 'SUPER_ADMIN'],
          description: '일반 사용자, 관리자, 최고관리자',
        },
      },
      responses: {
        ValidationError: {
          description: '요청 값 검증 실패 (VALIDATION_ERROR)',
          content: errorContent,
        },
        Unauthorized: {
          description:
            '인증 실패 (UNAUTHORIZED), accessToken 만료 (TOKEN_EXPIRED) 또는 권한 변경·탈퇴·비밀번호 변경/재설정으로 무효화된 토큰 (TOKEN_REVOKED, 쿠키 삭제)',
          content: errorContent,
        },
        Forbidden: {
          description:
            '접근 권한 없음 (FORBIDDEN) 또는 변경 요청에 X-CSRF-Protection 헤더 없음 (CSRF_REJECTED)',
          content: errorContent,
        },
        NotFound: {
          description: '대상을 찾을 수 없음 (NOT_FOUND)',
          content: errorContent,
        },
      },
    },
  },
  // 개발은 소스(.ts)를 직접 읽고, 운영은 dist만 배포되므로 빌드된 .js를 읽는다. (실행 위치 기준 상대 경로)
  apis: isProduction ? ['./dist/docs/*.js'] : ['./src/docs/*.ts'],
};

export default swaggerJSDoc(options);
