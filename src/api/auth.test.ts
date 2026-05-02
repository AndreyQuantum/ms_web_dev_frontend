import { describe, it, expect, beforeEach } from 'vitest';
import { authApi } from '@/api/auth';
import { setLatency } from '@/api/_latency';

describe('authApi.login', () => {
  beforeEach(() => {
    setLatency(0);
  });

  it('resolves with a non-empty token and admin user for correct credentials', async () => {
    const res = await authApi.login({ login: 'admin', password: 'admin' });
    expect(typeof res.token).toBe('string');
    expect(res.token.length).toBeGreaterThan(0);
    expect(res.user).toBeDefined();
    expect(res.user.login).toBe('admin');
    expect(res.user.role).toBe('admin');
  });

  it('rejects with an Error for wrong credentials', async () => {
    await expect(
      authApi.login({ login: 'wrong', password: 'wrong' }),
    ).rejects.toBeInstanceOf(Error);
  });

  it('rejects with an Error for an empty password', async () => {
    await expect(
      authApi.login({ login: 'admin', password: '' }),
    ).rejects.toBeInstanceOf(Error);
  });
});
