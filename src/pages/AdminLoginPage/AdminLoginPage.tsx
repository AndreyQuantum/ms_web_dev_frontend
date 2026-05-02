import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button/Button';

const STORAGE_KEY = 'lm_admin_token';

export function AdminLoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login.trim() || !password.trim()) {
      setError('Введите логин и пароль');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await authApi.login({ login, password });
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: res.token, user: res.user }),
      );
      navigate('/admin');
    } catch {
      setError('Неверный логин или пароль');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <h1>Вход в админку</h1>
      <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
        <div className="form-row">
          <label htmlFor="admin-login-login">Логин</label>
          <input
            id="admin-login-login"
            type="text"
            value={login}
            onChange={e => setLogin(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="form-row">
          <label htmlFor="admin-login-password">Пароль</label>
          <input
            id="admin-login-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error ? (
          <div role="alert" className="form-error">
            {error}
          </div>
        ) : null}

        <Button type="submit" loading={submitting}>
          Войти
        </Button>
      </form>
    </div>
  );
}
