'use client';

import { FormEvent, useState } from 'react';
import type { PublicSession, ScoreConsultation } from '@/lib/session';

type ScoreLookupProps = {
  readonly session: PublicSession;
  readonly onUnauthenticated: () => void;
};

function isScoreConsultation(body: unknown): body is ScoreConsultation {
  if (!body || typeof body !== 'object') return false;
  const score = body as Record<string, unknown>;
  return typeof score.rut === 'string'
    && typeof score.score === 'number'
    && typeof score.fecha === 'string';
}

function errorMessage(code: unknown): string {
  if (code === 'SCORE_FORBIDDEN') return 'No tienes permiso para consultar este RUT.';
  if (code === 'SCORE_INVALID_RUT') return 'El RUT ingresado no es válido.';
  if (code === 'SCORE_UNAUTHENTICATED') return 'Tu sesión expiró. Inicia sesión nuevamente.';
  return 'No pudimos consultar el score. Intenta nuevamente.';
}

export function ScoreLookup({ session, onUnauthenticated }: ScoreLookupProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ScoreConsultation | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rut = String(new FormData(event.currentTarget).get('rut') ?? '').trim();
    setPending(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/score/${encodeURIComponent(rut)}`, { cache: 'no-store' });
      const body: unknown = await response.json();
      if (response.status === 401) {
        onUnauthenticated();
        return;
      }
      if (!response.ok || !isScoreConsultation(body)) {
        const code = body && typeof body === 'object' ? (body as { code?: unknown }).code : undefined;
        setError(errorMessage(code));
        return;
      }
      setResult(body);
    } catch {
      setError('No pudimos consultar el score. Intenta nuevamente.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="stack">
      <form className="panel stack" onSubmit={onSubmit}>
        <p className="role-copy">
          {session.role === 'admin'
            ? 'Sesión de administrador: puedes consultar cualquier RUT válido.'
            : `Sesión de usuario: solo puedes consultar tu RUT ${session.rut}.`}
        </p>
        <div className="field">
          <label htmlFor="rut">RUT</label>
          <input
            id="rut"
            name="rut"
            required
            defaultValue={session.role === 'user' ? session.rut : ''}
            placeholder="12.345.678-5"
            autoComplete="off"
          />
        </div>
        {error ? <p role="alert" className="alert">{error}</p> : null}
        <button type="submit" className="primary" disabled={pending}>
          {pending ? 'Consultando…' : 'Consultar score'}
        </button>
      </form>
      {result ? (
        <article className="panel score-result" aria-live="polite">
          <p className="eyebrow">RESULTADO</p>
          <p className="score-rut">{result.rut}</p>
          <p className="score-value">{result.score}</p>
          <p className="score-date">Fecha {new Date(result.fecha).toLocaleString('es-CL', { timeZone: 'UTC' })} UTC</p>
        </article>
      ) : null}
    </div>
  );
}
