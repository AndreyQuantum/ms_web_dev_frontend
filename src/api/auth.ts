import { delay } from './_latency';
import type { LoginPayload, LoginResponse } from '@/types';

async function loginImpl(payload: LoginPayload): Promise<LoginResponse> {
  await delay();
  const { login, password } = payload ?? ({} as LoginPayload);
  if (!login || !password) {
    throw new Error('Invalid credentials');
  }
  if (login === 'admin' && password === 'admin') {
    return {
      token: 'mock-token',
      user: { login: 'admin', role: 'admin' },
    };
  }
  throw new Error('Invalid credentials');
}

export const authApi = {
  login: loginImpl,
};

// Defensive top-level export — some hooks/tests may import { login } directly.
export const login = (payload: LoginPayload) => authApi.login(payload);
