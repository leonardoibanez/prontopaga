import { render, screen, waitFor } from '@testing-library/react';
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
});
