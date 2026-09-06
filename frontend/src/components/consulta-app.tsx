'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ApiStatus } from '@/components/api-status';
import { LoginForm } from '@/components/login-form';
import { ScoreLookup } from '@/components/score-lookup';
import type { PublicSession } from '@/lib/session';

type SessionState = 'loading' | null | PublicSession;

function sessionFromPayload(body: unknown): PublicSession | null {
  if (!body || typeof body !== 'object') return null;
  const payload = body as Record<string, unknown>;
  if (payload.authenticated !== true) return null;
  if (payload.role === 'admin') return { role: 'admin' };
  if (payload.role === 'user' && typeof payload.rut === 'string' && payload.rut.length > 0) {
    return { role: 'user', rut: payload.rut };
  }
  return null;
}

export function ConsultaApp() {
  const [session, setSession] = useState<SessionState>('loading');

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadSession() {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store', signal: controller.signal });
        const body: unknown = await response.json();
        if (active) setSession(sessionFromPayload(body));
      } catch {
        if (active && !controller.signal.aborted) setSession(null);
      }
    }

    void loadSession();
    return () => { active = false; controller.abort(); };
  }, []);

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', cache: 'no-store' });
    } finally {
      setSession(null);
    }
  }

  const authenticated = session !== 'loading' && session !== null;

  return (
    <>
      <header className="header">
        <Link href="/" className="brand" aria-label="Consulta Riesgo Financiero, inicio">
          <span className="brand-icon" aria-hidden="true">CR</span>
          <span>Consulta Riesgo<br /><strong>Financiero</strong></span>
        </Link>
        <div className="header-actions">
          {authenticated ? <span className="badge">{session.role === 'admin' ? 'Administrador' : 'Usuario'}</span> : null}
          {authenticated ? <button type="button" onClick={() => { void logout(); }}>Cerrar sesión</button> : <span className="version">Acceso seguro</span>}
        </div>
      </header>
      <main>
        <section className="hero">
          <span className="eyebrow">CONSULTA RIESGO FINANCIERO</span>
          <h1>
            {authenticated
              ? <>Consulta el score <span>por RUT.</span></>
              : <>Inicia sesión para <span>consultar el score.</span></>}
          </h1>
          <p className="intro">
            {authenticated
              ? 'Evalúa el puntaje sintético de un RUT chileno. El acceso está limitado por el rol de tu sesión.'
              : 'Plataforma de consulta de riesgo financiero con autenticación JWT y control de acceso por roles.'}
          </p>
        </section>
        {session === 'loading' ? <p className="intro">Comprobando sesión…</p> : null}
        {session === null ? <LoginForm onAuthenticated={setSession} /> : null}
        {authenticated ? <ScoreLookup session={session} onUnauthenticated={() => setSession(null)} /> : null}
        <div className="status-slot">
          <ApiStatus />
        </div>
      </main>
      <footer>Consulta Riesgo Financiero <span>Demostración local</span></footer>
    </>
  );
}
