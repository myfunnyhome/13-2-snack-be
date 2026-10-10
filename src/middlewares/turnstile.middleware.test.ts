import type { Request, Response } from 'express';

import { requireTurnstileIfFlagged } from './turnstile.middleware';

function createRequest(turnstileToken?: string): Request {
  return { body: { turnstileToken } } as unknown as Request;
}

function createResponse(turnstileRequired: boolean): Response {
  return { locals: { turnstileRequired } } as unknown as Response;
}

function mockSiteverify(result: object, ok = true): jest.SpyInstance {
  return jest.spyOn(global, 'fetch').mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: async () => result,
  } as never);
}

const VALID_RESULT = {
  success: true,
  'error-codes': [],
  hostname: 'snack.example.com',
  action: 'signin',
};

describe('Turnstile 검사 (requireTurnstileIfFlagged)', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.CLIENT_URL = 'https://snack.example.com';
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    jest.restoreAllMocks();
  });

  test('표시도 토큰도 없으면 Siteverify 없이 통과한다', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    const next = jest.fn();

    await requireTurnstileIfFlagged(
      createRequest(),
      createResponse(false),
      next,
    );

    expect(next).toHaveBeenCalledWith();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test('표시가 있는데 토큰이 없으면 TURNSTILE_REQUIRED', async () => {
    await expect(
      requireTurnstileIfFlagged(
        createRequest(),
        createResponse(true),
        jest.fn(),
      ),
    ).rejects.toMatchObject({ statusCode: 403, code: 'TURNSTILE_REQUIRED' });
  });

  test('표시가 없어도 토큰이 오면 Siteverify로 검증한 뒤 통과한다', async () => {
    const fetchSpy = mockSiteverify(VALID_RESULT);
    const next = jest.fn();

    await requireTurnstileIfFlagged(
      createRequest('token'),
      createResponse(false),
      next,
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  test('표시가 없어도 유효하지 않은 토큰이면 TURNSTILE_FAILED', async () => {
    mockSiteverify({
      success: false,
      'error-codes': ['invalid-input-response'],
    });

    await expect(
      requireTurnstileIfFlagged(
        createRequest('token'),
        createResponse(false),
        jest.fn(),
      ),
    ).rejects.toMatchObject({ statusCode: 403, code: 'TURNSTILE_FAILED' });
  });

  test('이미 사용된 토큰이면 TURNSTILE_FAILED', async () => {
    mockSiteverify({
      success: false,
      'error-codes': ['timeout-or-duplicate'],
    });

    await expect(
      requireTurnstileIfFlagged(
        createRequest('token'),
        createResponse(true),
        jest.fn(),
      ),
    ).rejects.toMatchObject({ code: 'TURNSTILE_FAILED' });
  });

  test('hostname이 다르면 TURNSTILE_FAILED', async () => {
    mockSiteverify({ ...VALID_RESULT, hostname: 'other.example.com' });

    await expect(
      requireTurnstileIfFlagged(
        createRequest('token'),
        createResponse(true),
        jest.fn(),
      ),
    ).rejects.toMatchObject({ code: 'TURNSTILE_FAILED' });
  });

  test('action이 다르면 TURNSTILE_FAILED', async () => {
    mockSiteverify({ ...VALID_RESULT, action: 'signup' });

    await expect(
      requireTurnstileIfFlagged(
        createRequest('token'),
        createResponse(true),
        jest.fn(),
      ),
    ).rejects.toMatchObject({ code: 'TURNSTILE_FAILED' });
  });

  test('Siteverify가 HTTP 오류를 주면 TURNSTILE_FAILED (fail-closed)', async () => {
    mockSiteverify({}, false);

    await expect(
      requireTurnstileIfFlagged(
        createRequest('token'),
        createResponse(true),
        jest.fn(),
      ),
    ).rejects.toMatchObject({ code: 'TURNSTILE_FAILED' });
  });

  test('Siteverify 네트워크 오류·timeout이면 TURNSTILE_FAILED (fail-closed)', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('timeout'));

    await expect(
      requireTurnstileIfFlagged(
        createRequest('token'),
        createResponse(true),
        jest.fn(),
      ),
    ).rejects.toMatchObject({ code: 'TURNSTILE_FAILED' });
  });

  test('운영 환경에서는 테스트 키 응답도 hostname·action을 검증해 거부한다', async () => {
    process.env.NODE_ENV = 'production';
    mockSiteverify({
      success: true,
      'error-codes': [],
      hostname: 'example.com',
      metadata: { result_with_testing_key: true },
    });

    await expect(
      requireTurnstileIfFlagged(
        createRequest('token'),
        createResponse(true),
        jest.fn(),
      ),
    ).rejects.toMatchObject({ code: 'TURNSTILE_FAILED' });
  });

  test('운영이 아니면 테스트 키 응답을 통과시킨다', async () => {
    process.env.NODE_ENV = 'test';
    mockSiteverify({
      success: true,
      'error-codes': [],
      hostname: 'example.com',
      metadata: { result_with_testing_key: true },
    });
    const next = jest.fn();

    await requireTurnstileIfFlagged(
      createRequest('token'),
      createResponse(true),
      next,
    );

    expect(next).toHaveBeenCalledWith();
  });

  test('hostname과 action이 맞으면 통과한다', async () => {
    mockSiteverify(VALID_RESULT);
    const next = jest.fn();

    await requireTurnstileIfFlagged(
      createRequest('token'),
      createResponse(true),
      next,
    );

    expect(next).toHaveBeenCalledWith();
  });
});
