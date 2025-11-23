/* eslint-env vitest */
/// <reference types="vitest" />

import apiClient from '../apiClient';

describe('apiClient response interceptor', () => {
  it('attaches status/response/config/original to rejected error', async () => {
    type Handler = { fulfilled?: (value: unknown) => unknown; rejected?: (reason?: unknown) => unknown };
    const handlers = (apiClient.interceptors.response as unknown as { handlers: Handler[] }).handlers;
    const rejectedHandler = handlers.find((h) => h.rejected)?.rejected;

    expect(typeof rejectedHandler).toBe('function');
    if (!rejectedHandler) throw new Error('No rejected interceptor found');

    const mockErr = {
      response: { status: 502, data: { message: 'Bad Gateway' } },
      config: { url: '/notifications' },
      message: 'Request failed with status code 502',
    } as unknown as Error & { response?: { status: number; data: { message?: string } }; config?: Record<string, unknown> };

    // Call the interceptor's rejection handler and assert it rejects with
    // an enhanced Error object containing metadata.
    await expect(
      Promise.reject(mockErr).catch(rejectedHandler as (reason: unknown) => PromiseLike<never> | never)
    ).rejects.toMatchObject({
      message: 'Bad Gateway',
      status: 502,
      response: mockErr.response,
      config: mockErr.config,
      original: mockErr,
    });
  });
});
