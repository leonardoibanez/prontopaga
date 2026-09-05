# Entrega verificable del backend

Esta guía permite ejecutar y comprobar el backend local de demostración sin frontend, base de datos, proveedores ni credenciales reales. Los tres usuarios y sus contraseñas son datos sintéticos intencionales; no representan cuentas de producción.

## Ruta rápida

Todos los comandos siguientes se ejecutan desde la raíz del repositorio. Se requiere Node.js `>=24 <25` y npm 11 o superior.

```bash
npm ci --workspace backend --include-workspace-root
export JWT_SECRET="$(node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))")"
npm run build -w backend
npm run start -w backend
```

El comando de instalación usa el workspace `backend` e incluye el workspace raíz; no instala ni inicia el frontend. El script `start` del backend ejecuta `node dist/main.js` desde el directorio del workspace. El secreto se genera sólo para la sesión de shell y no debe guardarse, imprimirse ni copiarse a un archivo `.env` real. Sin un `JWT_SECRET` no vacío, el arranque falla deliberadamente.

El puerto local predeterminado es `3001`. Para usar otro, exportar un `PORT` entero entre `1` y `65535` antes del arranque. El valor de `FRONTEND_URL` sólo configura CORS y no es necesario para estas comprobaciones de backend.

## Contrato HTTP local

| Ruta | Autenticación | Resultado esperado |
| --- | --- | --- |
| `GET /api/health` | No | `200` con estado y marca temporal |
| `POST /login` | No | `200` y contrato Bearer para credenciales sintéticas válidas |
| `GET /score/:rut` | Bearer | `200`, `400`, `401` o `403`; siempre `Cache-Control: no-store` |

`/api/health` conserva el prefijo `/api`. En cambio, `POST /login` y `GET /score/:rut` son rutas raíz: no usar `/api/login` ni `/api/score/...`.

### Identidades sintéticas

| Usuario | Contraseña sintética | Rol | RUT permitido |
| --- | --- | --- | --- |
| `demo.admin` | `AdminDemo!2026` | `admin` | Cualquier RUT válido |
| `demo.user1` | `UserOneDemo!2026` | `user` | `12.345.678-5` |
| `demo.user2` | `UserTwoDemo!2026` | `user` | `9.876.543-3` |

El servidor determina rol y RUT desde su catálogo; el cliente no puede enviarlos durante el login. Los tokens duran 900 segundos. En la terminal, conservar el token sólo en una variable y no imprimirlo ni guardarlo en archivos.

### Flujos `curl`

Definir una URL local y comprobar salud:

```bash
BASE_URL=http://localhost:3001
curl "$BASE_URL/api/health"
```

Iniciar sesión con el primer usuario sintético y extraer el token sin mostrarlo:

```bash
TOKEN="$(curl --silent --show-error --fail \
  -X POST "$BASE_URL/login" \
  -H 'content-type: application/json' \
  --data '{"username":"demo.user1","password":"UserOneDemo!2026"}' \
  | node -e "let body=''; process.stdin.on('data', chunk => body += chunk); process.stdin.on('end', () => { const value = JSON.parse(body).access_token; if (!value) process.exit(1); process.stdout.write(value); })")"
```

Consultar el RUT propio devuelve `200`, el RUT normalizado, el puntaje sintético y `fecha` en ISO 8601 UTC (termina en `Z`):

```bash
curl --include \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/score/12.345.678-5"
```

La respuesta incluye `Cache-Control: no-store`. No almacenar respuestas ni tokens en cachés compartidos.

Los siguientes casos muestran el orden observable de validación y autorización:

```bash
# 401: falta autenticación, incluso si el RUT no es válido.
curl --include "$BASE_URL/score/no-es-rut"

# 401: token Bearer inválido.
curl --include -H 'Authorization: Bearer invalid-token' "$BASE_URL/score/no-es-rut"

# 403: demo.user1 intenta consultar el RUT válido de demo.user2.
curl --include -H "Authorization: Bearer $TOKEN" "$BASE_URL/score/9.876.543-3"

# 400: usuario autenticado con un RUT inválido.
curl --include -H "Authorization: Bearer $TOKEN" "$BASE_URL/score/no-es-rut"
```

Un administrador puede autenticarse con `demo.admin` y consultar cualquier RUT válido. Un usuario sólo puede consultar el RUT asignado en la tabla. Las respuestas de error de autenticación son genéricas; no usar mensajes de error como mecanismo de enumeración de usuarios.

### RUT y puntajes de demostración

El ejemplo `12.345.678-9` del PDF es inválido. El RUT canónico de esta guía es `12.345.678-5`.

Los valores `87`, `33` y `83` son resultados sintéticos y deterministas de SHA-256 (big-endian, módulo 101) para los RUT normalizados `12345678-5`, `9876543-3` y `6-K`, respectivamente. No son evaluaciones de riesgo, identificadores únicos ni garantías de ausencia de colisiones. No se consulta ninguna fuente financiera ni proveedor externo.

## Evidencia de regresión

Ejecutar los cuatro comandos desde la raíz, con Node 24 disponible en `PATH`:

```bash
npm run build -w backend
npm run typecheck -w backend
npm test -w backend
npm test
```

La evidencia de esta entrega se ejecutó con Node `24.20.0` y registró los siguientes resultados. Los hashes son SHA-256 de la salida capturada; no contienen secretos ni tokens.

| Comando exacto | Resultado | SHA-256 de salida |
| --- | --- | --- |
| `npm run build -w backend` | exit 0 | `017a6a91cbab5e2cc77a20f2093d3df2b964921561dfd398b7c237c94e40d7fe` |
| `npm run typecheck -w backend` | exit 0 | `9e740f88053be81bd013f40e4e863c37e7287ba648a790a2fa548ae31e280c5d` |
| `npm test -w backend` | exit 0; 30 pruebas aprobadas | `90736e23a5f99248b172f3bd2c01fef5113d1e2e9b5c23eaef4d51a0c1eeb748` |
| `npm test` | exit 0; 30 pruebas aprobadas | `2ec9f33d25010e1414184352d09f2c4f148b4faa1a8c834e927102ba154f44fb` |

No hay umbral de cobertura configurado. Estos resultados prueban las rutas indicadas en este repositorio y no constituyen una garantía de cobertura total, seguridad completa ni aptitud de producción.

## Matriz de requisitos y pruebas

Los nombres siguientes son los nombres reales de `node:test` en `backend/test/*.test.cjs`.

| Requisito | Pruebas observables |
| --- | --- |
| Arranque reproducible y secreto obligatorio | `parseBootstrapConfig conserva los valores explícitos`; `parseBootstrapConfig aplica ambos valores predeterminados`; `parseBootstrapConfig falla cuando JWT_SECRET falta o está vacío`; `createApplication también rechaza una configuración con JWT_SECRET vacío`; `parseBootstrapConfig rechaza puertos inválidos con el mensaje existente`; `compiled production startup fails closed without JWT_SECRET and terminates its child process` |
| Salud, prefijo y CORS | `GET /api/health responde con el estado del servicio`; `la ruta de health sin el prefijo api no reemplaza el contrato`; `CORS usa el origen configurado para solicitudes y preflight`; `CORS usa el origen predeterminado cuando FRONTEND_URL no está definido`; `el cierre de la aplicación libera el servidor efímero` |
| Login y contrato de token | `POST /login accepts exact demo credentials and returns the bearer contract`; `POST /login issues server-derived claims for all three synthetic identities`; `POST /login rejects non-object, malformed, missing, and extra credential fields`; `POST /login gives the same generic response for unknown usernames and wrong passwords`; `POST /login is literal and does not replace the api-prefixed route contract` |
| Validación RUT | `parseRut accepts every supported representation with the same fields`; `parseRut rejects malformed, non-string, and whitespace-containing input`; `normalization and canonical formatting preserve the parsed RUT`; `calculateRutCheckDigit maps modulo-11 numeric, zero, and K outcomes`; `isValidRut compares a supplied verification digit with modulo-11`; `RUT operations are deterministic and have no input coercion` |
| Autenticación Bearer y autorización | `AuthGuard reconstructs valid admin and user principals from issued bearer tokens`; `AuthGuard requires user RUT claims to already use the catalog normalization`; `AuthGuard uniformly denies malformed, untrusted, expired, and claim-drift bearer tokens`; `GET /score/:rut authenticates first, authorizes ownership, and marks all outcomes no-store`; `GET /score/:rut has the exact root contract and remains deterministic across instances` |
| Puntaje sintético y límites | `ScoreService calculates fixed synthetic goldens and only uses a trusted principal`; `calculateSyntheticScore uses SHA-256 big-endian modulo 101 goldens`; `ScoreService rejects invalid and unauthorized inputs before calculator or clock invocation` |

La matriz enumera las 30 pruebas observadas: 6 de arranque, 5 de salud, 5 de login, 6 de RUT, 3 de guardia Bearer y 5 de puntaje/ruta.

## Ejecución limpia y evidencia operativa

Además de los cuatro comandos, se validó un flujo aislado en un directorio temporal creado por el sistema. Se archivaron únicamente los manifiestos rastreados de raíz y `backend/`; no se copió frontend ni archivos de entorno. En ese directorio se ejecutó la instalación limpia del workspace backend, la compilación y el mismo objetivo que usa el script de inicio: `node dist/main.js` dentro de `backend/`. Se invocó directamente para conservar el PID del hijo y terminarlo sin dejar un proceso `node` huérfano.

| Paso aislado | Resultado observado |
| --- | --- |
| `npm ci --workspace backend --include-workspace-root` | exit 0; SHA-256 de salida `577d73d9df54afa438509d3e2d68d8afc81862a86436381bc3fab1f05e2deb3d`; frontend ausente |
| Compilación backend | exit 0; SHA-256 de salida `017a6a91cbab5e2cc77a20f2093d3df2b964921561dfd398b7c237c94e40d7fe` |
| Proceso temporal | PID `23317`, puerto temporal `32167`; terminó con `TERM` y fue recolectado |
| Salud y login | `GET /api/health` `200`; `POST /login` `200` |
| Consulta propia | `200`; RUT `12.345.678-5`, puntaje `87`, fecha UTC ISO y `Cache-Control: no-store` |
| Casos negativos | sin token `401`; token inválido `401`; RUT ajeno `403`; RUT inválido autenticado `400` |
| Limpieza | directorio temporal eliminado; SHA-256 del log de arranque `382689363e3ac2d01a7b7ec0ee0fada6ef651cfe4654c266ad853b3df0747ca8` |

Los registros persistidos para esta evidencia omitieron el secreto generado, los tokens Bearer y los cuerpos de credenciales. El PID y puerto anteriores son datos efímeros de una ejecución ya terminada, no valores de configuración.

## Revisión acotada de errores y exposición

Se revisaron de forma de sólo lectura los módulos de arranque, autenticación, RUT, puntaje y salud; las pruebas HTTP y unitarias; las identidades sintéticas; `backend/.env.example`; `.gitignore`; y los manifiestos y configuración rastreados. También se ejecutaron los cuatro comandos y el flujo aislado descritos arriba.

| Superficie | Evidencia observada | Hallazgo demostrado |
| --- | --- | --- |
| Arranque | `JWT_SECRET` vacío o ausente falla; el test de proceso compilado confirma la terminación | Ninguno |
| Login y Bearer | Credenciales desconocidas y contraseña errónea comparten respuesta genérica; la guardia rechaza tokens malformados, expirados o con claims divergentes | Ninguno |
| Consulta protegida | Se autentica antes de validar el RUT; se controla propiedad para usuarios y se marca `no-store` en todos los resultados de score | Ninguno |
| Datos y configuración | `.env.example` deja el secreto vacío; archivos de entorno están ignorados; la evidencia no registra secretos ni tokens | Ninguno |
| Fixtures sintéticos | Las tres credenciales se muestran sólo como datos de demostración documentados | Ninguno |

Esta revisión no evaluó despliegue, TLS, límite de tasa, almacenamiento persistente, monitoreo, rotación de secretos, SSO, multitenencia, dependencias de producción ni sistemas externos. Por tanto, no afirma certificación, ausencia total de vulnerabilidades ni preparación para producción.

## Límites y preservación

Esta entrega no añade un harness persistente, frontend, PDF, `.gitignore`, archivo `.env` real, base de datos, proveedor externo ni endurecimiento especulativo. Para revertirla, basta revertir `README.md` y `docs/backend-delivery.md`; no existe estado externo ni persistente que limpiar.

## Declaración de uso de IA

Se utilizaron Codex y modelos de OpenAI, junto con gentle-ai y Engram, como asistencia para organizar y generar borradores de módulos del backend, estructuras de pruebas y documentación. La responsabilidad de comprobar el comportamiento descrito recae en la evidencia de comandos y pruebas registrada en esta guía. Esta declaración no afirma que exista una revisión humana adicional.
