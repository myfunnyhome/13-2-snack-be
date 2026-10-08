import type { Request, Response } from 'express';

import { requireTurnstileIfFlagged } from './turnstile.middleware';

function createRequest(turnstileToken?: string): Request {
  return { body: { turnstileToken } } as unknown as Request;
}

function createResponse(turnstileRequired: boolean): Response {
  return { locals: { turnstileRequired } } as unknown as Response;
}

function mockSiteverify(result: object): jest.SpyInstance {
  return jest
    .spyOn(global, 'fetch')
    .mockResolvedValue({ json: async () => result } as never);
}

describe('Turnstile 검사 (requireTurnstileIfFlagged)', () => {
  beforeEach(() => {
    process.env.CLIENT_URL = 'https://snack.example.com';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('반복 실패 표시가 없으면 Siteverify 없이 통과한다', async () => {
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

  test('Siteverify가 실패하면 TURNSTILE_FAILED', async () => {
    mockSiteverify({ success: false });

    await expect(
      requireTurnstileIfFlagged(
        createRequest('token'),
        createResponse(true),
        jest.fn(),
      ),
    ).rejects.toMatchObject({ statusCode: 403, code: 'TURNSTILE_FAILED' });
  });

  test('hostname이나 action이 다르면 TURNSTILE_FAILED', async () => {
    mockSiteverify({
      success: true,
      hostname: 'other.example.com',
      action: 'signin',
    });

    await expect(
      requireTurnstileIfFlagged(
        createRequest('token'),
        createResponse(true),
        jest.fn(),
      ),
    ).rejects.toMatchObject({ code: 'TURNSTILE_FAILED' });
  });

  test('Siteverify 장애·timeout이면 TURNSTILE_FAILED (fail-closed)', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('timeout'));

    await expect(
      requireTurnstileIfFlagged(
        createRequest('token'),
        createResponse(true),
        jest.fn(),
      ),
    ).rejects.toMatchObject({ code: 'TURNSTILE_FAILED' });
  });

  test('hostname과 action이 맞으면 통과한다', async () => {
    mockSiteverify({
      success: true,
      hostname: 'snack.example.com',
      action: 'signin',
    });
    const next = jest.fn();

    await requireTurnstileIfFlagged(
      createRequest('token'),
      createResponse(true),
      next,
    );

    expect(next).toHaveBeenCalledWith();
  });
});
