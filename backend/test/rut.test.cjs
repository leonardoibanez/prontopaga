const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateRutCheckDigit,
  formatRut,
  isValidRut,
  normalizeRut,
  parseRut,
} = require('../dist/rut/rut');

test('parseRut accepts every supported representation with the same fields', () => {
  for (const input of ['123456785', '12345678-5', '12.345.678-5']) {
    assert.deepEqual(parseRut(input), { body: '12345678', checkDigit: '5' });
  }

  assert.deepEqual(parseRut('1.009-k'), { body: '1009', checkDigit: 'K' });
  assert.deepEqual(parseRut('6-K'), { body: '6', checkDigit: 'K' });
});

test('parseRut rejects malformed, non-string, and whitespace-containing input', () => {
  for (const input of [
    null,
    undefined,
    123456785,
    '',
    ' 12.345.678-5',
    '12.345.678-5\n',
    '12.34.567-5',
    '01.234.567-8',
    '123456789-5',
    '12.345.6785',
    '12.345.678--5',
    '12.345.678-5x',
  ]) {
    assert.equal(parseRut(input), null);
  }
});

test('normalization and canonical formatting preserve the parsed RUT', () => {
  assert.equal(normalizeRut('1.009-k'), '1009-K');
  assert.equal(normalizeRut('12.345.678-5'), '12345678-5');
  assert.equal(formatRut('1009-K'), '1.009-K');
  assert.equal(formatRut('6-K'), '6-K');
  assert.equal(normalizeRut('12.34.567-5'), null);
  assert.equal(formatRut({ body: '1009' }), null);
});

test('calculateRutCheckDigit maps modulo-11 numeric, zero, and K outcomes', () => {
  assert.equal(calculateRutCheckDigit('12345678'), '5');
  assert.equal(calculateRutCheckDigit('14'), '0');
  assert.equal(calculateRutCheckDigit('6'), 'K');
  assert.equal(calculateRutCheckDigit('0'), null);
  assert.equal(calculateRutCheckDigit('123456789'), null);
  assert.equal(calculateRutCheckDigit(12345678), null);
});

test('isValidRut compares a supplied verification digit with modulo-11', () => {
  for (const input of ['12.345.678-5', '14-0', '6-K', '6-k']) {
    assert.equal(isValidRut(input), true);
  }

  for (const input of ['12.345.678-9', '6-0', '12.34.567-5', null]) {
    assert.equal(isValidRut(input), false);
  }
});

test('RUT operations are deterministic and have no input coercion', () => {
  const input = '12.345.678-5';
  assert.equal(normalizeRut(input), normalizeRut(input));
  assert.equal(formatRut(input), formatRut(input));
  assert.equal(isValidRut(input), isValidRut(input));
  assert.equal(isValidRut({ toString: () => input }), false);
});
