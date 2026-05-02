import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

vi.mock('@/api/auth', () => ({
  login: vi.fn(async (payload: { login: string; password: string }) => {
    if (payload.login === 'admin' && payload.password === 'admin') {
      return { token: 'mock-token', user: { login: 'admin', role: 'admin' as const } };
    }
    throw new Error('invalid');
  }),
}));

import { AuthProvider, useAuth } from '@/hooks/useAuth';

const STORAGE_KEY = 'lm_admin_token';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with token=null and role=null when localStorage is empty', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.token).toBeNull();
    expect(result.current.role).toBeNull();
  });

  it('logs in successfully with admin/admin: role becomes "admin", token is non-empty, localStorage is populated', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('admin', 'admin');
    });

    await waitFor(() => {
      expect(result.current.role).toBe('admin');
    });
    expect(typeof result.current.token).toBe('string');
    expect(result.current.token).not.toBe('');
    expect(result.current.token).not.toBeNull();

    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(stored).not.toBe('');
  });

  it('rejects on bad credentials and leaves role as null', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.login('x', 'y');
      })
    ).rejects.toBeDefined();

    expect(result.current.role).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('logout() clears the in-memory state and removes the localStorage entry', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('admin', 'admin');
    });

    await waitFor(() => {
      expect(result.current.role).toBe('admin');
    });
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

    act(() => {
      result.current.logout();
    });

    expect(result.current.role).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('a fresh hook instance hydrates from existing localStorage (persistence)', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: 'persisted-token',
        user: { login: 'admin', role: 'admin' },
      })
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.role).toBe('admin');
    expect(result.current.token).toBe('persisted-token');
  });
});
