import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScoreLookup } from './score-lookup';

describe('ScoreLookup', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows a score for an authorized RUT', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rut: '12.345.678-5', score: 87, fecha: '2026-09-06T12:00:00.000Z' }),
    }));

    render(<ScoreLookup session={{ role: 'user', rut: '12345678-5' }} onUnauthenticated={vi.fn()} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Consultar score' }));

    await waitFor(() => {
      expect(screen.getByText('87')).toBeInTheDocument();
    });
    expect(fetch).toHaveBeenCalledWith('/api/score/12345678-5', expect.objectContaining({ cache: 'no-store' }));
  });

  it('explains when the RUT is not allowed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ status: 'error', code: 'SCORE_FORBIDDEN' }),
    }));

    render(<ScoreLookup session={{ role: 'user', rut: '12345678-5' }} onUnauthenticated={vi.fn()} />);
    const rut = screen.getByLabelText('RUT');
    await userEvent.setup().clear(rut);
    await userEvent.setup().type(rut, '9876543-3');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Consultar score' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('No tienes permiso para consultar este RUT.');
  });

  it('returns to login when the session is no longer valid', async () => {
    const onUnauthenticated = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ status: 'error', code: 'SCORE_UNAUTHENTICATED' }),
    }));

    render(<ScoreLookup session={{ role: 'admin' }} onUnauthenticated={onUnauthenticated} />);
    await userEvent.setup().type(screen.getByLabelText('RUT'), '12345678-5');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Consultar score' }));

    await waitFor(() => expect(onUnauthenticated).toHaveBeenCalled());
  });
});
