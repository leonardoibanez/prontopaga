# Consulta Riesgo Financiero

Backend de demostración con NestJS 11 y puntajes sintéticos deterministas para RUT chilenos. Esta entrega documenta únicamente el backend: el frontend, las integraciones externas y los datos financieros reales no forman parte de este flujo.

## Inicio rápido del backend

Ejecutar **desde la raíz del repositorio** con Node.js `>=24 <25` y npm 11 o superior:

```bash
npm ci --workspace backend --include-workspace-root
export JWT_SECRET="$(node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))")"
npm run build -w backend
npm run start -w backend
```

El proceso escucha en `http://localhost:3001`. La variable `JWT_SECRET` debe ser una cadena local no vacía; si falta, el arranque falla. No crear ni editar un archivo `.env` real para esta demostración.

Comprobación inicial:

```bash
curl http://localhost:3001/api/health
```

La ruta de estado usa `/api/health`; las rutas de autenticación y consulta son las rutas raíz `POST /login` y `GET /score/:rut`.

## Guía detallada

La guía de backend incluye las credenciales sintéticas, los flujos `curl` de éxito y error, la matriz de pruebas, evidencia reproducible y límites conocidos:

- [Entrega y verificación del backend](docs/backend-delivery.md)

## Límites del alcance

No se agregan base de datos, proveedores, modelos financieros reales, despliegue, TLS, límites de tasa, SSO, multitenencia ni integración frontend. El PDF original, `.gitignore`, el frontend y los archivos de entorno reales permanecen sin cambios.
