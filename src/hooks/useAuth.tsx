import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import * as authApi from '@/api/auth';

// Inline `AdminUser` until T2 lands `@/types/auth`. Keep this in sync with
// the persistence contract documented in the T5 tests.
export interface AdminUser {
  login: string;
  role: 'admin';
}

interface AuthState {
  token: string | null;
  user: AdminUser | null;
}

interface AuthContextValue extends AuthState {
  role: 'admin' | null;
  isAuthenticated: boolean;
  login: (login: string, password: string) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = 'lm_admin_token';
const AuthContext = createContext<AuthContextValue | null>(null);

function readPersisted(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw) as AuthState;
    if (!parsed?.token || !parsed?.user) return { token: null, user: null };
    return parsed;
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => readPersisted());

  const login = async (loginName: string, password: string) => {
    const res = await authApi.login({ login: loginName, password });
    const next: AuthState = { token: res.token, user: res.user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setState(next);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ token: null, user: null });
  };

  const value: AuthContextValue = {
    ...state,
    role: state.user?.role ?? null,
    isAuthenticated: state.user?.role === 'admin',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
