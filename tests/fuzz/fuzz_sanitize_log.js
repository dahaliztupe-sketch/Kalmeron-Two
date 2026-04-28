/**
 * Fuzz target: sanitizeLogValue.
 * Goal: ensure the sanitizer always returns a single-line, control-char-free
 * string regardless of input.
 */
'use strict';

const { sanitizeLogValue } = require('../../dist-fuzz/sanitize-log.js');

module.exports.fuzz = function (data) {
  let input;
  try {
    input = data.toString('utf8');
  } catch {
    return;
  }
  if (input.length > 16_384) return;
  const out = sanitizeLogValue(input);
  if (typeof out !== 'string') {
    throw new Error('sanitizeLogValue returned non-string');
  }
  if (/[\r\n\t\x00-\x1f]/.test(out)) {
    throw new Error('sanitizeLogValue leaked control chars');
  }
};
