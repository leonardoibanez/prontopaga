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

La página inicial comprueba la conexión con el backend e incluye estados de carga, error y reintento. Los valores predeterminados permiten iniciar el proyecto sin copiar los archivos de entorno.

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
| Frontend | `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` |

`FRONTEND_URL` define el origen permitido por CORS. `NEXT_PUBLIC_API_URL` es una dirección pública utilizada por el navegador e incluye el prefijo `/api`; debe configurarse antes de compilar el frontend. No colocar secretos en variables `NEXT_PUBLIC_*`.

## Alcance inicial

Incluye la estructura ejecutable y la conexión frontend/backend. Aún no incluye autenticación, base de datos, proveedores financieros ni cálculos de riesgo. Las funcionalidades futuras aparecen identificadas como «Próximamente» y no muestran resultados financieros simulados.

Referencias oficiales: [NestJS](https://docs.nestjs.com/first-steps) y [Next.js](https://nextjs.org/docs/app/getting-started/installation).
