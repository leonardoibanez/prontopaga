# RUT Validation Specification

## Purpose

Define a deterministic, pure utility for parsing, normalizing, formatting, and
verifying Chilean RUT syntax and modulo-11 checksums. This stage does not assert
registry or legal-identity validity.

## Requirements

### Requirement: Strictly parse supported RUT forms

The utility MUST accept a positive body of 1–8 decimal digits without leading
zeros, followed by a numeric verification digit or `K` (case-insensitive). It
MUST accept compact (`123456785`), unpunctuated hyphen (`12345678-5`), and
dotted hyphen forms (`12.345.678-5`). Dotted bodies MUST use standard groups:
one to three leading digits followed by zero or more three-digit groups. Inputs
with whitespace, missing components, extra punctuation, malformed dot groups,
or arbitrary characters MUST be rejected.

#### Scenario: Accept each supported representation

- GIVEN the same valid RUT is written as `123456785`, `12345678-5`, or `12.345.678-5`
- WHEN each input is parsed
- THEN each is accepted and exposes the same body and verification digit

#### Scenario: Reject whitespace and malformed structure

- GIVEN ` 12.345.678-5`, `12.34.567-5`, or `01.234.567-8`
- WHEN each input is parsed
- THEN each is rejected before checksum validation

### Requirement: Normalize and format canonically

The utility MUST normalize accepted input by removing permitted dots, retaining
exactly one hyphen before the verification digit, and uppercasing `k` to `K`; it
MUST NOT trim or remove whitespace. Canonical formatting MUST return the body
with three-digit dot grouping, a hyphen, and an uppercase verification digit.

#### Scenario: Normalize case and punctuation

- GIVEN `1.009-k`
- WHEN it is normalized and formatted
- THEN the canonical result is `1.009-K`
- AND `1009-K` is the normalized unformatted representation

#### Scenario: Preserve significant leading digits

- GIVEN a valid one-digit body such as `6-K`
- WHEN it is canonically formatted
- THEN the result is `6-K` without invented leading zeros

### Requirement: Verify modulo-11 checksums

The utility MUST calculate the Chilean modulo-11 verification digit using the
body digits and MUST support outcomes `0`, `1–9`, and `K`. Validation MUST reject
a syntactically valid value whose supplied digit does not match the calculated
digit. For example, `12.345.678-5` is valid and `12.345.678-9` is invalid.

#### Scenario: Accept numeric and K checksums

- GIVEN `14-0` and `6-K`
- WHEN checksum validation runs
- THEN both values are accepted

#### Scenario: Reject an incorrect checksum

- GIVEN `12.345.678-9`
- WHEN checksum validation runs
- THEN the value is rejected although its syntax is well formed

### Requirement: Remain pure and registry-independent

The utility MUST perform only parsing, normalization, formatting, and checksum
work with no HTTP, NestJS, persistence, external lookup, or mutable global
state. Unit tests MUST cover the requirements above without claiming SII or
other registry validity.

#### Scenario: Same input has deterministic results

- GIVEN an accepted RUT input
- WHEN the utility is called repeatedly with unchanged input
- THEN it returns the same result and performs no external operation
