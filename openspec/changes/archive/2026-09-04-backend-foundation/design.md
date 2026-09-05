# Design: Establish a Shared Backend Bootstrap

## Technical Approach

Extract environment parsing and Nest application creation into `backend/src/bootstrap.ts`. Production parses `process.env`, creates the configured application, and listens on the parsed port; tests pass isolated environment objects to the same functions and listen on port `0` at `127.0.0.1`. This preserves the existing Express adapter and keeps process startup out of the reusable factory.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Bootstrap boundary | Export pure `parseBootstrapConfig` and async `createApplication` functions | Bootstrap service/provider; importing `main.ts` | Configuration is not a domain service. Functions avoid DI ceremony and importing `main.ts` side effects. |
| Environment access | Require an explicit read-only environment argument | Read `process.env` throughout; mutate `process.env` in tests | Production remains explicit, while tests cannot leak environment changes across cases. |
| Listening ownership | Keep `listen` and startup logging in `main.ts` | Listen inside the shared factory | Tests need an ephemeral loopback listener; production alone owns its fixed port and process error handling. |
| Behavioral verification | Use `node:test`, real HTTP requests, and public Nest lifecycle methods | Add a test library; inspect private Nest state | This proves observable prefix/CORS/teardown behavior without dependencies or brittle internals. |

## Data Flow

```text
process.env ──> parseBootstrapConfig ──> createApplication ──> main.ts listen(config.port)
test object ──> parseBootstrapConfig ──> createApplication ──> listen(0, 127.0.0.1) ──> close()
```

`createApplication` creates `AppModule`, applies the `api` prefix, enables CORS for `config.frontendUrl`, and enables shutdown hooks before returning the unbound application.

## File Changes

| File | Action | Description |
|---|---|---|
| `backend/src/bootstrap.ts` | Create | Define config contracts, exact port validation, and the shared Nest factory. |
| `backend/src/main.ts` | Modify | Load dotenv/metadata, parse `process.env`, create the app, listen, and preserve logging/error handling. |
| `backend/test/health.test.cjs` | Modify | Consume compiled bootstrap exports, add config/CORS/prefix assertions, and close ephemeral apps. |

## Interfaces / Contracts

```ts
export interface BootstrapEnvironment {
  readonly FRONTEND_URL?: string;
  readonly PORT?: string;
}

export interface BootstrapConfig {
  readonly frontendUrl: string;
  readonly port: number;
}

export function parseBootstrapConfig(environment: BootstrapEnvironment): BootstrapConfig;

export interface CreateApplicationOptions {
  readonly logger?: false;
}

export function createApplication(
  config: BootstrapConfig,
  options?: CreateApplicationOptions,
): Promise<INestApplication>;
```

`parseBootstrapConfig` preserves `FRONTEND_URL ?? 'http://localhost:3000'`, `Number(PORT ?? 3001)`, the inclusive `1..65535` integer constraint, and the exact error text `PORT debe ser un número entre 1 y 65535.`. `createApplication` always applies the prefix, CORS, and shutdown hooks. The optional logger flag supports the existing quiet test server without changing production defaults.

## Testing Strategy

Strict RED → GREEN → REFACTOR applies. Runtime commands use `PATH="/tmp/node-v24.20.0-darwin-arm64/bin:$PATH"`; final backend proof is root `npm test`, with `npm run typecheck -w backend` as an explicit type check.

| Layer | Test matrix | Approach |
|---|---|---|
| Unit | Explicit URL/port; both defaults; non-integer; below `1`; above `65535`; exact error message | Call `parseBootstrapConfig` with fresh plain objects; never mutate `process.env`. |
| HTTP integration | `GET /api/health` body/status; `/health` is not a replacement; configured and default CORS origins | Create through the shared factory, listen on `0`/loopback, inspect normal and preflight response headers. |
| Lifecycle | Application can listen ephemerally and release its HTTP server | Register `t.after` immediately after creation, await `app.close()`, and verify the underlying server is no longer listening. |
| Production boundary | Configured/default port reaches `app.listen`; startup errors retain existing catch/log/exit behavior | Keep this wiring small and covered through parser tests plus build/type checking; do not execute `main.ts` in-process. |

## Threat Matrix

N/A — this change adds no routing decision, shell/subprocess execution, VCS/PR automation, executable-file classification, or external process-integration boundary. The existing HTTP prefix is preserved, not redesigned.

## Migration / Rollout

No migration, dependency, feature flag, or phased rollout is required. Reverting the three file changes restores the prior bootstrap.

## Open Questions

None.
