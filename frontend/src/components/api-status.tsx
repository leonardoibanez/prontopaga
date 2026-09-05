'use client';

import { useEffect, useState } from 'react';

type Status = 'loading' | 'connected' | 'error';

function isHealthyResponse(body: unknown): body is { status: 'ok'; service: string; timestamp: string } {
  if (!body || typeof body !== 'object') return false;

  const health = body as Record<string, unknown>;
  return health.status === 'ok'
    && typeof health.service === 'string'
    && health.service.length > 0
    && typeof health.timestamp === 'string';
}

export function ApiStatus() {
  const [status, setStatus] = useState<Status>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 8000);

    async function checkConnection() {
      try {
        const response = await fetch('/api/health', {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('API no disponible');
        const body: unknown = await response.json();
        if (!isHealthyResponse(body)) {
          throw new Error('Respuesta no válida');
        }
        if (active) setStatus('connected');
      } catch {
        if (active) setStatus('error');
      } finally {
        clearTimeout(timeout);
      }
    }

    void checkConnection();
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [attempt]);

  return (
    <section className="connection" aria-label="Conexión al servicio">
      <div role="status" aria-live="polite" className="connection-copy">
        <span className={`status-dot ${status}`} aria-hidden="true" />
        <div>
          <strong>{status === 'loading' ? 'Comprobando conexión…' : status === 'connected' ? 'Servicio conectado' : 'Servicio no disponible'}</strong>
          <p>{status === 'error' ? 'No pudimos conectar. Intenta nuevamente en unos momentos.' : 'Estado de conexión con Consulta Riesgo Financiero.'}</p>
        </div>
      </div>
      <button type="button" onClick={() => { setStatus('loading'); setAttempt((value) => value + 1); }}>
        {status === 'loading' ? 'Comprobando…' : 'Verificar conexión'}
      </button>
    </section>
  );
}
