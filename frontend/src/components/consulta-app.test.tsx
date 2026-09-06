import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConsultaApp } from './consulta-app';

const HEALTHY = {
  ok: true,
  json: async () => ({
    status: 'ok',
    service: 'Consulta Riesgo Financiero',
    timestamp: '2026-09-05T00:00:00.000Z',
  }),
};

describe('ConsultaApp', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the login form when there is no session', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url === '/api/auth/session') {
        return Promise.resolve({ ok: true, json: async () => ({ authenticated: false }) });
      }
      return Promise.resolve(HEALTHY);
    }));

    render(<ConsultaApp />);

    expect(await screen.findByRole('heading', { name: /Inicia sesión para consultar el score/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Usuario')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Servicio conectado'));
  });

  it('shows score consultation for an authenticated administrator', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url === '/api/auth/session') {
        return Promise.resolve({ ok: true, json: async () => ({ authenticated: true, role: 'admin' }) });
      }
      return Promise.resolve(HEALTHY);
    }));

    render(<ConsultaApp />);

    expect(await screen.findByRole('heading', { name: /Consulta el score por RUT/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
    expect(screen.getByLabelText('RUT')).toBeInTheDocument();
  });

  it('keeps the authenticated view when logout fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url === '/api/auth/session') {
        return Promise.resolve(Response.json({ authenticated: true, role: 'admin' }));
      }
      if (url === '/api/auth/logout') {
        return Promise.resolve(Response.json({ status: 'error' }, { status: 500 }));
      }
      return Promise.resolve(Response.json(awaitableHealth()));
    }));

    render(<ConsultaApp />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Cerrar sesión' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cerrar la sesión. Intenta nuevamente.');
    expect(screen.getByLabelText('RUT')).toBeInTheDocument();
  });

  it('shows a persistent expiry notice after returning to login', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url === '/api/auth/session') {
        return Promise.resolve(Response.json({ authenticated: true, role: 'admin' }));
      }
      if (url.startsWith('/api/score/')) {
        return Promise.resolve(Response.json(
          { status: 'error', code: 'SCORE_UNAUTHENTICATED' },
          { status: 401 },
        ));
      }
      return Promise.resolve(Response.json(awaitableHealth()));
    }));

    render(<ConsultaApp />);
    await userEvent.setup().type(await screen.findByLabelText('RUT'), '12345678-5');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Consultar score' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Tu sesión expiró. Inicia sesión nuevamente.');
    expect(screen.getByLabelText('Usuario')).toBeInTheDocument();
  });
});

function awaitableHealth() {
  return {
    status: 'ok',
    service: 'Consulta Riesgo Financiero',
    timestamp: '2026-09-05T00:00:00.000Z',
  };
}
