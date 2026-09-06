import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RootLayout, { metadata } from './layout';
import Home from './page';

describe('application shell', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('declares Spanish metadata and document language', () => {
    expect(metadata.title).toBe('Consulta Riesgo Financiero');
    const document = RootLayout({ children: <main>Contenido</main> });
    expect(document.type).toBe('html');
    expect(document.props.lang).toBe('es');
    expect(document.props.children.type).toBe('body');
  });

  it('renders the home application', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => Promise.resolve(Response.json(
      url === '/api/auth/session'
        ? { authenticated: false }
        : { status: 'ok', service: 'Consulta Riesgo Financiero', timestamp: '2026-09-06T00:00:00.000Z' },
    ))));

    render(<Home />);

    expect(await screen.findByRole('heading', { name: /Inicia sesión para consultar el score/i })).toBeInTheDocument();
  });
});
