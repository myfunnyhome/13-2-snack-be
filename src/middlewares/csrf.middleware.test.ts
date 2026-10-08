import type { Request, Response } from 'express';

import { ForbiddenError } from '../types/errors';
import { requireCsrfHeader } from './csrf.middleware';

function createRequest(method: string, xhr = false): Request {
  return { method, xhr } as unknown as Request;
}

describe('CSRF 헤더 검사 (requireCsrfHeader)', () => {
  test('조회 요청(GET)은 헤더 없이 통과한다', () => {
    const next = jest.fn();

    requireCsrfHeader(createRequest('GET'), {} as Response, next);

    expect(next).toHaveBeenCalledWith();
  });

  test('변경 요청에 X-Requested-With: XMLHttpRequest가 있으면 통과한다', () => {
    const next = jest.fn();

    requireCsrfHeader(createRequest('POST', true), {} as Response, next);

    expect(next).toHaveBeenCalledWith();
  });

  test('변경 요청에 헤더가 없으면 403 CSRF_REJECTED로 거부한다', () => {
    const next = jest.fn();

    requireCsrfHeader(createRequest('DELETE'), {} as Response, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ForbiddenError);
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('CSRF_REJECTED');
  });
});
