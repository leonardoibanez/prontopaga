# Frontend Test Foundation Specification

## Purpose

Define the runnable frontend test foundation and workspace-level fast regression boundary for stage 1. This capability does not implement authentication, sessions, RUT, score, or other product workflows.

## Requirements

### Requirement: Fast frontend test harness

The frontend workspace MUST provide a Vitest harness using React Testing Library and jsdom, with a frontend test command that runs unit/component/route tests without requiring a live backend. The harness MUST support strict TDD evidence: after harness setup, the first health behavior test MUST demonstrate a real failing RED result before its implementation is added.

#### Scenario: Harness executes a frontend fast suite

- GIVEN Node.js `>=24 <25` and dependencies installed from the workspace root
- WHEN the documented frontend fast-test command is run
- THEN Vitest executes the frontend tests in jsdom and exits successfully for passing tests
- AND no backend listener or external credential is required

#### Scenario: Strict TDD records behavioral RED

- GIVEN the harness is runnable and the health behavior test is authored before its implementation
- WHEN the initial test is run
- THEN it fails for the intended missing behavior with a non-zero result
- AND subsequent implementation and refactoring preserve the same test as GREEN evidence

### Requirement: Separate runnable browser smoke harness

A Playwright smoke harness MUST be configured with its own explicit command, separate from the root fast-test command. It MUST be runnable against an intentionally selected base URL and MUST NOT be included in `npm test`.

#### Scenario: Browser smoke remains an explicit check

- GIVEN a running target application and the documented Playwright dependencies
- WHEN the explicit browser smoke command is run
- THEN Playwright launches the smoke scenario against the selected base URL
- AND root `npm test` does not launch a browser or require that target

### Requirement: Workspace regression and quality checks

Root `npm test` MUST run both the existing backend regression suite and the frontend fast suite. Stage verification MUST also run Node 24, root lint and typecheck, root build, and the existing backend regression commands; frontend lint, typecheck, and build MUST pass. Existing Spanish UI copy and the light-teal plain CSS shell MUST remain intact.

#### Scenario: Root fast regression covers both workspaces

- GIVEN Node 24 and a clean dependency installation
- WHEN `npm test` runs from the workspace root
- THEN backend regressions and frontend fast tests both execute and pass
- AND the separate Playwright smoke command is not invoked

#### Scenario: Foundation quality gates preserve the shell

- GIVEN the foundation changes are applied
- WHEN root lint, typecheck, and build plus backend regression commands are run under Node 24
- THEN all applicable commands pass
- AND the existing Spanish-facing light-teal plain-CSS shell remains unchanged in behavior and presentation
