'use client';

import { FormEvent, useState } from 'react';
import type { PublicSession } from '@/lib/session';

type LoginFormProps = {
  readonly onAuthenticated: (session: PublicSession) => void;
};

function sessionFromResponse(body: unknown): PublicSession | null {
  if (!body || typeof body !== 'object') return null;
  const session = body as Record<string, unknown>;
  if (session.role === 'admin') return { role: 'admin' };
  if (session.role === 'user' && typeof session.rut === 'string' && session.rut.length > 0) {
    return { role: 'user', rut: session.rut };
  }
  return null;
}

export function LoginForm({ onAuthenticated }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = String(form.get('username') ?? '');
    const password = String(form.get('password') ?? '');
    setPending(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ username, password }),
      });
      const body: unknown = await response.json();
      const session = sessionFromResponse(body);
      if (!response.ok || session === null) {
        const code = body && typeof body === 'object' ? (body as { code?: unknown }).code : undefined;
        setError(code === 'LOGIN_INVALID_CREDENTIALS'
          ? 'No pudimos iniciar sesión. Verifica tus credenciales.'
          : 'No pudimos iniciar sesión. Intenta nuevamente.');
        return;
      }
      onAuthenticated(session);
    } catch {
      setError('No pudimos iniciar sesión. Intenta nuevamente.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="panel stack" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="username">Usuario</label>
        <input id="username" name="username" autoComplete="username" required minLength={3} maxLength={64} />
      </div>
      <div className="field">
        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} maxLength={128} />
      </div>
      {error ? <p role="alert" className="alert">{error}</p> : null}
      <button type="submit" className="primary" disabled={pending}>
        {pending ? 'Ingresando…' : 'Iniciar sesión'}
      </button>
      <details className="hint">
        <summary>Cuentas de demostración</summary>
        <ul>
          <li><code>demo.admin</code> / <code>AdminDemo!2026</code> — consulta cualquier RUT</li>
          <li><code>demo.user1</code> / <code>UserOneDemo!2026</code> — RUT 12.345.678-5</li>
          <li><code>demo.user2</code> / <code>UserTwoDemo!2026</code> — RUT 9.876.543-3</li>
        </ul>
      </details>
    </form>
  );
}
