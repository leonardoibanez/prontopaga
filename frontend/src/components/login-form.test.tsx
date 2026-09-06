import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('authenticates through the same-origin login route', async () => {
    const onAuthenticated = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ role: 'user', rut: '12345678-5' }),
    }));

    render(<LoginForm onAuthenticated={onAuthenticated} />);
    await userEvent.setup().type(screen.getByLabelText('Usuario'), 'demo.user1');
    await userEvent.setup().type(screen.getByLabelText('Contraseña'), 'UserOneDemo!2026');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    await waitFor(() => {
      expect(onAuthenticated).toHaveBeenCalledWith({ role: 'user', rut: '12345678-5' });
    });
    expect(fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
      method: 'POST',
      cache: 'no-store',
    }));
  });

  it('shows a clear error when credentials are rejected', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ status: 'error', code: 'LOGIN_INVALID_CREDENTIALS' }),
    }));

    render(<LoginForm onAuthenticated={vi.fn()} />);
    await userEvent.setup().type(screen.getByLabelText('Usuario'), 'demo.user1');
    await userEvent.setup().type(screen.getByLabelText('Contraseña'), 'WrongPass!2026');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos iniciar sesión. Verifica tus credenciales.');
  });
});
