import { test, expect, describe } from 'vitest';
import { classifyTaskComplexity } from '../src/lib/model-router';

describe('Task Complexity Classification', () => {
  test('should classify simple tasks correctly', () => {
    expect(classifyTaskComplexity('write a quick test')).toBe('simple');
  });
  test('should classify complex tasks correctly', () => {
    expect(classifyTaskComplexity('system architecture analyze design')).toBe('complex');
  });
});
