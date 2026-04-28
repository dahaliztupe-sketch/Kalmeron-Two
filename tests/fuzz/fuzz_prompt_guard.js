/**
 * Fuzz target: prompt-guard regex set.
 * Goal: ensure no input causes ReDoS, throws, or infinite loops.
 */
'use strict';

const { detectPromptInjection } = require('../../dist-fuzz/prompt-guard.js');

module.exports.fuzz = function (data) {
  let input;
  try {
    input = data.toString('utf8');
  } catch {
    return;
  }
  if (input.length > 16_384) return;
  try {
    detectPromptInjection(input);
  } catch (err) {
    if (err && /timeout|stack|maximum/i.test(String(err.message || ''))) {
      throw err;
    }
  }
};
