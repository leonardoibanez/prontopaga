import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiStatus } from './api-status';

describe('ApiStatus', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'ok',
          service: 'Consulta Riesgo Financiero',
          timestamp: '2026-09-05T00:00:00.000Z',
        }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the existing Spanish connection shell', async () => {
    render(<ApiStatus />);

    expect(screen.getByRole('status')).toHaveTextContent('Comprobando conexión…');

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Servicio conectado');
    });
  });

  it('requests health through the same-origin route', async () => {
    render(<ApiStatus />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/health',
        expect.objectContaining({ cache: 'no-store' }),
      );
    });
  });

  it('reports an error when the health payload is incomplete', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok' }),
    } as Response);

    render(<ApiStatus />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Servicio no disponible');
    });
  });

  it('supersedes an in-flight request when connection checking is retried', async () => {
    let resolveFirstRequest: (response: Response) => void;
    const firstRequest = new Promise<Response>((resolve) => {
      resolveFirstRequest = resolve;
    });
    const healthyResponse = {
      ok: true,
      json: async () => ({
        status: 'ok',
        service: 'Consulta Riesgo Financiero',
        timestamp: '2026-09-05T00:00:00.000Z',
      }),
    } as Response;
    vi.mocked(fetch)
      .mockImplementationOnce(() => firstRequest)
      .mockResolvedValueOnce(healthyResponse);

    render(<ApiStatus />);
    const retryButton = screen.getByRole('button', { name: 'Comprobando…' });

    expect(retryButton).toBeEnabled();
    await userEvent.setup().click(retryButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
    expect(vi.mocked(fetch).mock.calls[0][1]?.signal?.aborted).toBe(true);

    resolveFirstRequest!(healthyResponse);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Servicio conectado');
    });
  });

  it('aborts an in-flight request when unmounted', async () => {
    let resolveRequest: (response: Response) => void;
    const pendingRequest = new Promise<Response>((resolve) => {
      resolveRequest = resolve;
    });
    vi.mocked(fetch).mockImplementationOnce(() => pendingRequest);

    const { unmount } = render(<ApiStatus />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const signal = vi.mocked(fetch).mock.calls[0][1]?.signal;

    unmount();

    expect(signal?.aborted).toBe(true);
    resolveRequest!({ ok: true, json: async () => ({ status: 'ok' }) } as Response);
  });
});
