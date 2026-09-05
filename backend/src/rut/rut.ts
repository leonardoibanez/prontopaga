export type RutCheckDigit =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'K';

export interface ParsedRut {
  readonly body: string;
  readonly checkDigit: RutCheckDigit;
}

const COMPACT_PATTERN = /^([1-9]\d{0,7})([0-9Kk])$/;
const HYPHENATED_PATTERN = /^([1-9]\d{0,7})-([0-9Kk])$/;
const DOTTED_PATTERN = /^([1-9]\d{0,2}(?:\.\d{3})+)-([0-9Kk])$/;
const BODY_PATTERN = /^[1-9]\d{0,7}$/;
const CHECK_DIGIT_WEIGHTS = [2, 3, 4, 5, 6, 7] as const;

function exactMatch(pattern: RegExp, input: string): RegExpMatchArray | null {
  const match = input.match(pattern);
  return match?.[0] === input ? match : null;
}

function toCheckDigit(input: string): RutCheckDigit {
  return input.toUpperCase() as RutCheckDigit;
}

function isRutBody(body: unknown): body is string {
  return (
    typeof body === 'string' &&
    exactMatch(BODY_PATTERN, body) !== null
  );
}

function formatRutBody(body: string): string {
  return body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseRut(input: unknown): ParsedRut | null {
  if (typeof input !== 'string') {
    return null;
  }

  const match =
    exactMatch(COMPACT_PATTERN, input) ??
    exactMatch(HYPHENATED_PATTERN, input) ??
    exactMatch(DOTTED_PATTERN, input);

  if (match === null) {
    return null;
  }

  const body = match[1].replaceAll('.', '');
  if (!isRutBody(body)) {
    return null;
  }

  return Object.freeze({ body, checkDigit: toCheckDigit(match[2]) });
}

export function normalizeRut(input: unknown): string | null {
  const parsedRut = parseRut(input);
  return parsedRut === null
    ? null
    : `${parsedRut.body}-${parsedRut.checkDigit}`;
}

export function formatRut(input: unknown): string | null {
  const parsedRut = parseRut(input);
  if (parsedRut === null) {
    return null;
  }

  return `${formatRutBody(parsedRut.body)}-${parsedRut.checkDigit}`;
}

export function calculateRutCheckDigit(body: unknown): RutCheckDigit | null {
  if (!isRutBody(body)) {
    return null;
  }

  let sum = 0;
  for (let index = body.length - 1; index >= 0; index -= 1) {
    const weight = CHECK_DIGIT_WEIGHTS[(body.length - 1 - index) % CHECK_DIGIT_WEIGHTS.length];
    sum += Number(body[index]) * weight;
  }

  const candidate = 11 - (sum % 11);
  if (candidate === 11) {
    return '0';
  }
  if (candidate === 10) {
    return 'K';
  }
  return String(candidate) as RutCheckDigit;
}

export function isValidRut(input: unknown): boolean {
  const parsedRut = parseRut(input);
  return (
    parsedRut !== null &&
    calculateRutCheckDigit(parsedRut.body) === parsedRut.checkDigit
  );
}
