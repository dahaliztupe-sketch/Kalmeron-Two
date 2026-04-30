/**
 * Fuzz target: prompt-guard regex set.
 * Goal: ensure no input causes ReDoS, throws, or infinite loops across the
 * full stack of prompt-guard primitives (sanitize → isolate → validate → score).
 */
'use strict';

const {
  sanitizeInput,
  isolateUserInput,
  validatePromptIntegrity,
  scorePromptRisk,
} = require('../../dist-fuzz/prompt-guard.js');

module.exports.fuzz = function (data) {
  let input;
  try {
    input = data.toString('utf8');
  } catch {
    return;
  }
  if (input.length > 16_384) return;
  try {
    const sanitized = sanitizeInput(input);
    isolateUserInput(sanitized);
    validatePromptIntegrity(input);
    scorePromptRisk(input);
  } catch (err) {
    // Re-raise only catastrophic failures (ReDoS / stack overflow). Any other
    // throw is a legitimate "rejected" signal from the guard.
    if (err && /timeout|stack|maximum/i.test(String(err.message || ''))) {
      throw err;
    }
  }
};
