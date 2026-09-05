# Backend Delivery Specification

## Purpose

Define a reproducible, backend-only delivery guide for the existing npm workspace, with executable synthetic API examples, bounded security evidence, and traceable verification. This capability does not implement production risk scoring or frontend integration.

## Requirements

### Requirement: Reproducible backend-only quick path

The documentation MUST state Node.js `>=24 <25`, npm workspace installation from the repository root, local non-empty `JWT_SECRET` generation, and backend startup from the repository root with the exact working directory for every command. It MUST use temporary shell/environment values and MUST NOT require editing a real `.env`.

#### Scenario: Fresh developer starts the backend

- GIVEN a clean checkout with Node 24 and npm available
- WHEN the developer follows the root-scoped install, generated-secret, and `npm run start -w backend` steps
- THEN the backend starts on its documented local port without frontend, database, or external credentials

#### Scenario: Missing secret remains fail-closed

- GIVEN no non-empty `JWT_SECRET` is supplied
- WHEN backend startup is attempted
- THEN startup fails and the guide does not suggest a fallback secret or tracked secret file

### Requirement: Executable synthetic API contract

The guide MUST provide copyable `curl` flows using only the three synthetic accounts and canonical demo RUT `12.345.678-5`, covering health, login, authorized score success, and observable `401`, `403`, and authenticated-invalid-RUT `400` outcomes. It MUST state root `/login` and `/score/:rut` versus `/api/health`, UTC `fecha`, `Cache-Control: no-store`, and that PDF sample `12.345.678-9` is invalid.

#### Scenario: Positive and negative curls are reproducible

- GIVEN the locally started backend and synthetic credentials
- WHEN a reader runs the documented login and score commands, including missing/invalid authorization, cross-user ownership, and invalid-RUT cases
- THEN responses match `200`, `401`, `403`, and `400` contracts without real identities or financial data

### Requirement: Traceable regression evidence

The guide MUST include a requirements-to-evidence matrix whose entries use actual `node:test` names from `backend/test/*.test.cjs`, and MUST record these exact root-scoped commands: `npm run build -w backend`, `npm run typecheck -w backend`, `npm test -w backend`, and `npm test`. It MUST report observed results, not imply coverage thresholds or complete assurance.

#### Scenario: Evidence can be independently replayed

- GIVEN the documented Node 24 environment
- WHEN all four commands are run from the repository root
- THEN the evidence records each command's exit result and maps requirements to real test names

### Requirement: Bounded error and credential-exposure review

The delivery MUST log a focused review of backend error paths, HTTP responses, logs, fixtures, and tracked configuration, distinguishing demonstrated defects from unreviewed risk. Evidence MUST contain no secrets, credentials, tokens, PII, or copied financial records; any proven runtime defect MUST be fixed only through strict RED-GREEN-REFACTOR with a behavioral failing test.

#### Scenario: Review record is safe and scoped

- GIVEN the review examines only the backend delivery surfaces
- WHEN findings and command evidence are recorded
- THEN sensitive values are redacted or synthetic, limitations are explicit, and no speculative hardening is presented as a fix

### Requirement: Documentation, AI, and preservation boundaries

The guide MUST remain Spanish-facing like the existing README while the SDD artifact remains English. It MUST state that deterministic SHA-256 goldens `87`, `33`, and `83` are synthetic outputs—not risk assessments, uniqueness guarantees, or collision-free identifiers—and include an AI declaration naming the tools used and the code areas they helped generate, exactly as required by the PDF. Frontend integration is deferred. The original PDF, `.gitignore`, frontend, and any real `.env` MUST remain unmodified.

#### Scenario: Out-of-scope artifacts stay unchanged

- GIVEN the backend-only documentation work is completed
- WHEN the change is reviewed
- THEN only permitted backend/docs artifacts differ; PDF, `.gitignore`, frontend, and real environment files are preserved
