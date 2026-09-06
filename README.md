# Consulta Riesgo Financiero

MVP de consulta de score crediticio sintético para RUT chilenos. El backend (NestJS 11) emite JWT HS256 de 900 segundos con emisor y audiencia; el frontend (Next.js 16) autentica por un BFF same-origin y guarda el Bearer en una cookie HttpOnly. El BFF valida cada sesión contra el endpoint protegido `GET /me`, por lo que no confía en tokens solamente decodificados.

## Inicio rápido

Node.js `>=24 <25` y npm 11 o superior, desde la raíz:

```bash
npm ci
cp frontend/.env.example frontend/.env
export JWT_SECRET="$(node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))")"
export DEMO_MODE=true
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

`JWT_SECRET` debe contener al menos 32 bytes y nunca debe versionarse. `BACKEND_URL` y `APP_ORIGIN` son variables de servidor; no uses prefijos `NEXT_PUBLIC_` para ellas. HTTP solo se acepta en loopback; cualquier origen remoto debe usar HTTPS.

También puedes ejecutar cada lado por separado. Para el backend de producción local usa `npm run build -w backend` antes de `npm run start -w backend`; durante desarrollo usa `npm run dev -w backend`.

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
| `GET /api/auth/session` | `GET /me` |
| `GET /api/score/:rut` | `GET /score/:rut` |

El token Bearer no se expone a JavaScript. Las mutaciones exigen `Origin` igual a `APP_ORIGIN`; un `401` del backend elimina la cookie. Login y score aplican límites en memoria por IP/cuenta o principal y responden `429` con `Retry-After`.

Las identidades incluidas son exclusivamente sintéticas. `NODE_ENV=production` deshabilita el modo demo por defecto y rechaza explícitamente `DEMO_MODE=true`. Para un despliegue real debe sustituirse el catálogo por un proveedor de identidad y el rate limiter en memoria por almacenamiento compartido o un gateway.

## Pruebas

```bash
npm test
npm run test:coverage
npm run lint
npm run typecheck
npm run test:e2e
```

La cobertura tiene umbrales obligatorios y genera LCOV en cada workspace. GitHub Actions ejecuta instalación limpia, auditoría, lint, typecheck, cobertura, build y Playwright en cada pull request y push a `main`.

La guía de backend, flujos `curl` y límites conocidos está en [docs/backend-delivery.md](docs/backend-delivery.md). El uso de IA se registra en [ai_interactions.md](ai_interactions.md).
