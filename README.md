# Consulta Riesgo Financiero

MVP de consulta de score crediticio sintético para RUT chilenos. El backend (NestJS 11) emite JWT de 900 segundos; el frontend (Next.js 16) autentica por un BFF same-origin y guarda la sesión en una cookie HttpOnly.

## Inicio rápido

Node.js `>=24 <25` y npm 11 o superior, desde la raíz:

```bash
npm ci
cp frontend/.env.example frontend/.env
export JWT_SECRET="$(node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))")"
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

`JWT_SECRET` debe ser una cadena local no vacía. `BACKEND_URL` y `APP_ORIGIN` son variables de servidor; no uses prefijos `NEXT_PUBLIC_` para ellas.

También puedes ejecutar cada lado por separado: `npm run start -w backend` y `npm run dev -w frontend`.

## Cuentas de demostración

| Usuario | Contraseña | Rol | RUT permitido |
| --- | --- | --- | --- |
| `demo.admin` | `AdminDemo!2026` | `admin` | Cualquier RUT válido |
| `demo.user1` | `UserOneDemo!2026` | `user` | `12.345.678-5` |
| `demo.user2` | `UserTwoDemo!2026` | `user` | `9.876.543-3` |

Un usuario solo puede consultar su propio RUT. Un administrador puede consultar cualquier RUT válido.

## Contratos

| Ruta del navegador | Upstream |
| --- | --- |
| `GET /api/health` | `GET /api/health` |
| `POST /api/auth/login` | `POST /login` |
| `POST /api/auth/logout` | — |
| `GET /api/auth/session` | — |
| `GET /api/score/:rut` | `GET /score/:rut` |

El token Bearer no se expone al navegador. Las mutaciones exigen `Origin` igual a `APP_ORIGIN`.

## Pruebas

```bash
npm test
npm run lint
npm run typecheck
npm run test:e2e
```

La guía de backend, flujos `curl` y límites conocidos está en [docs/backend-delivery.md](docs/backend-delivery.md). El uso de IA se registra en [ai_interactions.md](ai_interactions.md).
