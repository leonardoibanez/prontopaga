# Design: Frontend Foundation

## Technical Approach

Stage 1 makes frontend tests runnable, then records a behavioral RED against the existing `ApiStatus` before changing health behavior. A Node-runtime App Router handler becomes the browser-to-backend boundary: validate server-only `BACKEND_URL`, call one fixed path with an eight-second abort, and return bounded, non-cacheable responses. Authentication, score, cookies, and backend changes remain excluded.

## Architecture Decisions

| Decision | Choice | Alternatives / tradeoff | Rationale |
|---|---|---|---|
| Fast harness | Vitest + React Testing Library + jsdom; route tests opt into `// @vitest-environment node` | jsdom gives inaccurate Node `Request`/`Response`; separate runners duplicate setup | Matches components while exercising handlers with Node 24 Web APIs. No async Server Component is tested. |
| Server boundary | `src/server/backend-origin.ts` imports `server-only`; `BACKEND_URL` is read per request and normalized only after validation | `NEXT_PUBLIC_API_URL` leaks topology; a rewrite hides validation/error policy | Next.js keeps non-`NEXT_PUBLIC_` values server-side, and App Router Route Handlers use Web `Request`/`Response`. |
| Origin validation | Require an absolute `http:`/`https:` URL with hostname, no credentials, query, hash, or non-root path; return `url.origin` | Suffix-only checks admit unsafe forms | Makes authority explicit and prevents path composition. |
| Proxy policy | Fetch `${origin}/api/health` with `cache: 'no-store'`, `redirect: 'error'`, and an `AbortController` timer of 8,000 ms | Following redirects can escape the fixed target; forwarding upstream errors leaks detail | Preserves the backend contract while bounding latency and disclosure. |
| Browser smoke | Explicit root `test:e2e` with two non-reused Playwright `webServer` processes | Putting it in `npm test` requires browsers/listeners | Production-mode smoke proves the real path with owned cleanup. |

Evidence: [Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers), [Vitest](https://nextjs.org/docs/app/guides/testing/vitest), [environment variables](https://nextjs.org/docs/pages/guides/environment-variables), [Playwright servers](https://playwright.dev/docs/test-webserver).

## Data Flow

```text
ApiStatus -> same-origin GET /api/health -> validate BACKEND_URL
                                      -> GET {origin}/api/health
                                      <- valid health JSON | bounded error
```

Success returns the validated upstream object unchanged. Every response sets `Cache-Control: no-store`. Configuration failure is `500 {"status":"error","code":"HEALTH_CONFIG_ERROR"}` without fetch; upstream non-success, redirect, invalid JSON, or invalid shape is `502` with `HEALTH_UPSTREAM_ERROR`; timeout/abort is `504` with `HEALTH_UPSTREAM_TIMEOUT`. Valid payloads contain `status: "ok"`, nonempty string `service`, and ISO-parseable string `timestamp`.

## File Changes

| File | Action | Description |
|---|---|---|
| `package.json`, `package-lock.json` | Modify | Root fast test runs backend then frontend; explicit E2E builds both workspaces and runs Playwright. |
| `frontend/package.json` | Modify | Add test dependencies and deterministic `test`/`test:e2e` scripts. |
| `frontend/vitest.config.ts`, `frontend/src/test/setup.ts`, `frontend/src/test/server-only.ts` | Create | jsdom harness, jest-dom cleanup, path aliases, and test-only marker stub. |
| `frontend/src/components/api-status.test.tsx`, `frontend/src/components/api-status.tsx` | Create/Modify | Same-origin, Spanish states, retry, supersession, and unmount cancellation. |
| `frontend/src/server/backend-origin.ts`, `frontend/src/server/backend-origin.test.ts` | Create | Server-only origin parser and adversarial configuration cases. |
| `frontend/src/app/api/health/route.ts`, `route.test.ts` | Create | Node route and success/500/502/504/no-store/fixed-target tests. |
| `frontend/playwright.config.ts`, `frontend/e2e/health.spec.ts` | Create | Real-backend smoke with isolated ports and controlled teardown. |
| `frontend/.env.example` | Modify | Replace public `/api` URL with `BACKEND_URL=http://localhost:3001`. |

## Testing Strategy

Harness proof starts GREEN with an existing-shell render test. The first health test asserts `ApiStatus` requests `/api/health`; it fails against the current public URL (behavioral RED), then client work makes it GREEN. Route tests come first; a missing-module failure is not behavioral RED. Add only a compile seam, rerun for response-contract RED, then implement and refactor. Use fake timers for timeout tests.

Run with `PATH="/tmp/node-v24.20.0-darwin-arm64/bin:$PATH"`: `npm test`, `npm run lint` (the existing root script applies to frontend only), `npm run typecheck`, `npm run build`, and separate `npm run test:e2e`. Do not claim a backend lint command: none exists.

Playwright uses `127.0.0.1:3101` and `:3100`, a synthetic `JWT_SECRET`, server-only `BACKEND_URL`, `reuseExistingServer: false`, and bounded `SIGTERM` then forced cleanup. Smoke asserts Spanish shell text and connected status; evidence shows both ports released.

## Threat Matrix

| Boundary | Minimum adversarial cases | Applicability | Design response | Planned RED tests |
|---|---|---|---|---|
| Documentation-like paths | `requirements.txt`, `CMakeLists.txt`, executable MD/MDX, `README.sh` | N/A — no classification | None | None |
| Git repository selection | `git -C`, relative/absolute paths | N/A — no VCS | None | None |
| Commit state | staged, `commit -a`, empty index | N/A — parent owns commit | None | None |
| Push state | tracking, first push, refspec | N/A — no push | None | None |
| PR commands | `--head`, env prefix, composition | N/A — no PR automation | None | None |

Process integration is limited to Playwright-owned fixed commands: no user-composed shell input, no inherited backend URL, fail on occupied ports, and always terminate both process groups.

## Migration / Rollout

No migration or flag. Deliver as one parent-owned stage commit (`exception-ok`, no chain). Roll back listed files together to restore direct health access and backend-only tests.

## Open Questions

None.
