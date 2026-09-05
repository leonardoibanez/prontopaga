# Design: Backend RUT Utility

## Technical Approach

Add one pure CommonJS-compiled TypeScript module at `backend/src/rut/rut.ts` and one `node:test` suite. The module first parses only the three specified textual forms, then exposes normalization, formatting, checksum calculation, and validation as separate deterministic operations. It has no NestJS wiring, I/O, mutable state, or dependencies.

## Architecture Decisions

| Decision | Choice | Alternatives and tradeoff | Rationale |
|---|---|---|---|
| Runtime-safe public API | Accept `unknown`; return `null` for parse/transform/calculation failure and `false` for validation failure | Throwing errors makes ordinary invalid input exceptional; accepting only `string` is not safe at runtime | Callers can handle untrusted values without coercion or exceptions while TypeScript contracts remain explicit. |
| Syntax before checksum | `parseRut` validates structure only; `isValidRut` compares the supplied digit with `calculateRutCheckDigit` | Combining both would prevent inspection/normalization of syntactically valid values with a wrong checksum | Matches the specification's distinct syntax and checksum requirements. |
| Strict form recognition | Use separate exact-match patterns for compact, plain-hyphen, and dotted-hyphen forms; require the complete match length to equal input length | Stripping punctuation/whitespace is shorter but accepts malformed values; `$` alone can match before a final newline | Explicit parsing rejects whitespace, malformed grouping, excess punctuation, and newline-suffixed input. |
| String representation | Keep the body as a digit string and the digit as an uppercase union | Numeric conversion is unnecessary and could hide leading-zero errors | Preserves exact syntax and avoids coercion. |
| No framework abstraction | Export plain functions and immutable result data | A Nest provider/module adds lifecycle and DI without a dependency boundary | The capability is pure and has no Nest integration requirement. |

## Data Flow

```text
unknown input -> exact syntax parser -> { body, checkDigit }
                                      |-> normalize: body-checkDigit
                                      |-> format: grouped.body-checkDigit
                                      `-> validate: calculated digit === supplied digit
```

Checksum calculation walks body digits right-to-left with repeating weights `2,3,4,5,6,7`. For `candidate = 11 - (sum % 11)`, `11` maps to `0`, `10` maps to `K`, and other values map to their decimal digit.

## File Changes

| File | Action | Description |
|---|---|---|
| `backend/src/rut/rut.ts` | Create | Pure parser, normalizer, formatter, checksum calculator, and validator. |
| `backend/test/rut.test.cjs` | Create | Behavioral tests importing compiled CommonJS output from `backend/dist/rut/rut`. |

## Interfaces / Contracts

```ts
export type RutCheckDigit = '0' | '1' | '2' | '3' | '4' |
  '5' | '6' | '7' | '8' | '9' | 'K';

export interface ParsedRut {
  readonly body: string;
  readonly checkDigit: RutCheckDigit;
}

export function parseRut(input: unknown): ParsedRut | null;
export function normalizeRut(input: unknown): string | null;
export function formatRut(input: unknown): string | null;
export function calculateRutCheckDigit(body: unknown): RutCheckDigit | null;
export function isValidRut(input: unknown): boolean;
```

`parseRut` accepts only: compact `BODYDV`; plain `BODY-DV`; or dotted-hyphen form whose body has 1–3 leading digits followed by one or more `.DDD` groups. The undotted body is 1–8 digits, starts with `1–9`, and `DV` is `0–9`, `k`, or `K`. Dotted syntax requires at least one dot and exact three-digit trailing groups. Normalization removes dots but retains one hyphen and uppercases `K`. Formatting groups the parsed body from the right.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | All accepted forms; lowercase `k`; one- and eight-digit boundaries; normalization and grouping; numeric, `0`, and `K` checksums; known valid/invalid examples | Add table-driven `node:test` assertions. |
| Negative unit | Non-strings, empty input, zero/leading-zero body, overlong body, whitespace including final newline, malformed dots/hyphens, invalid characters, wrong checksum | Assert `null` or `false` according to the public contract. |
| Regression | Existing eight foundation tests | Root `npm test` remains the required backend-only command. |

Strict TDD is mandatory: write behavioral tests first, then add only compilable exported signature stubs returning `null` or `false` without domain logic. Run `npm test` and capture expected-value assertion failures before implementing behavior; missing-module, compilation, or export errors do not satisfy behavioral RED. Implement only the minimal behavior needed for GREEN, complete cases incrementally, and REFACTOR only while green. No test is executed during design.

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. Untrusted input is nevertheless handled by exact runtime type and syntax checks without coercion.

## Migration / Rollout

No migration or feature flag is required. The utility is initially unused by application wiring and can be removed with its test file.

## Open Questions

None.
