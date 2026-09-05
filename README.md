# Consulta Riesgo Financiero

Base de proyecto con **NestJS 11** para el backend y **Next.js 16** (App Router, React 19) para el frontend. Ambos usan TypeScript y se administran con npm workspaces.

## Requisitos

- Node.js 24 LTS (ver `.nvmrc`).
- npm 11 o superior.

## Instalación y desarrollo

Desde la raíz del repositorio:

```bash
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3001/api
- Estado del backend: http://localhost:3001/api/health

La página inicial comprueba la conexión con el backend e incluye estados de carga, error y reintento. El backend conserva valores predeterminados para el puerto y CORS, pero exige un secreto de firma local.

El backend requiere `JWT_SECRET`; generá uno local antes de iniciarlo:

```bash
openssl rand -hex 32
```

## Estructura

```text
backend/
  src/main.ts             # Arranque, prefijo /api y CORS
  src/app.module.ts       # Módulo principal
  src/health/             # Endpoint de estado
  test/                   # Prueba HTTP del backend
frontend/
  src/app/                # Página inicial, layout y estilos
  src/components/         # Comprobación de conexión con la API
```

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia ambos proyectos con recarga automática |
| `npm run dev:backend` | Inicia solamente NestJS |
| `npm run dev:frontend` | Inicia solamente Next.js |
| `npm run build` | Compila ambos proyectos |
| `npm run typecheck` | Verifica tipos en ambos proyectos |
| `npm run lint` | Ejecuta ESLint en el frontend |
| `npm test` | Compila y prueba el endpoint HTTP del backend |

Después de compilar, ejecutar en terminales separadas:

```bash
npm run start -w backend
npm run start -w frontend
```

## Variables de entorno

| Proyecto | Variable | Valor predeterminado |
| --- | --- | --- |
| Backend | `PORT` | `3001` |
| Backend | `FRONTEND_URL` | `http://localhost:3000` |
| Backend | `JWT_SECRET` | Requerido, sin valor predeterminado |
| Frontend | `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` |

`FRONTEND_URL` define el origen permitido por CORS. `NEXT_PUBLIC_API_URL` es una dirección pública utilizada por el navegador e incluye el prefijo `/api`; debe configurarse antes de compilar el frontend. No colocar secretos en variables `NEXT_PUBLIC_*`.

## Autenticación de demostración

`POST /login` emite un token Bearer de 15 minutos para pruebas locales. Las siguientes credenciales son sintéticas y no representan cuentas de producción:

| Usuario | Contraseña | Rol |
| --- | --- | --- |
| `demo.admin` | `AdminDemo!2026` | `admin` |
| `demo.user1` | `UserOneDemo!2026` | `user` |
| `demo.user2` | `UserTwoDemo!2026` | `user` |

El cliente no puede enviar rol ni RUT en el inicio de sesión; ambos atributos proceden exclusivamente del catálogo del servidor. Esta etapa no incluye registro ni renovación de tokens.

## Consulta sintética protegida

`GET /score/:rut` consulta un puntaje sintético determinista para un RUT chileno válido. La ruta está fuera del prefijo `/api`, requiere un Bearer token y responde con `Cache-Control: no-store`.

```bash
curl -H "Authorization: Bearer <token>" http://localhost:3001/score/12.345.678-5
```

Una cuenta `user` sólo puede consultar su propio RUT; `admin` puede consultar cualquier RUT válido. La respuesta contiene únicamente `rut`, `score` (0 a 100) y `fecha`. Es una transformación local de demostración, no un cálculo de riesgo financiero ni una consulta a proveedores.

## Alcance inicial

Incluye la estructura ejecutable, la conexión frontend/backend y autenticación de demostración con usuarios sintéticos. Aún no incluye base de datos, proveedores financieros ni cálculos de riesgo. Las funcionalidades futuras aparecen identificadas como «Próximamente» y no muestran resultados financieros simulados.

Referencias oficiales: [NestJS](https://docs.nestjs.com/first-steps) y [Next.js](https://nextjs.org/docs/app/getting-started/installation).
