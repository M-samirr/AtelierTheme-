import { describe, it, expect } from 'vitest';
import {
  settingBoolean,
  settingChoice,
  settingList,
  settingNumber,
  settingText,
} from '../../app/lib/settings';

describe('settingBoolean', () => {
  it('keeps real booleans and parses the string/number forms the dashboard sends', () => {
    expect(settingBoolean(true, false)).toBe(true);
    expect(settingBoolean(false, true)).toBe(false);
    expect(settingBoolean('true', false)).toBe(true);
    expect(settingBoolean('0', true)).toBe(false);
    expect(settingBoolean(1, false)).toBe(true);
  });

  it('falls back when a store never saved the setting', () => {
    expect(settingBoolean(undefined, true)).toBe(true);
    expect(settingBoolean(null, false)).toBe(false);
    expect(settingBoolean('yes', true)).toBe(true);
  });
});

describe('settingChoice', () => {
  const ratios = ['portrait', 'square', 'auto'] as const;

  it('accepts the plain value, the [{ value }] shape and a single object', () => {
    expect(settingChoice('square', ratios, 'portrait')).toBe('square');
    expect(settingChoice([{ value: 'auto', label: 'x' }], ratios, 'portrait')).toBe('auto');
    expect(settingChoice({ value: 'square' }, ratios, 'portrait')).toBe('square');
  });

  it('rejects values outside the allowed list', () => {
    expect(settingChoice('landscape', ratios, 'portrait')).toBe('portrait');
    expect(settingChoice(undefined, ratios, 'portrait')).toBe('portrait');
    expect(settingChoice([{ value: 42 }], ratios, 'square')).toBe('square');
  });
});

describe('settingList', () => {
  it('normalises multichoice values to strings', () => {
    expect(settingList(['a', { value: 'b' }, { value: 3 }, ''])).toEqual(['a', 'b']);
    expect(settingList('only')).toEqual(['only']);
    expect(settingList(undefined)).toEqual([]);
  });
});

describe('settingText', () => {
  it('returns the text or the fallback for blank values', () => {
    expect(settingText('Hello', 'x')).toBe('Hello');
    expect(settingText('   ', 'x')).toBe('x');
    expect(settingText(null)).toBe('');
  });
});

describe('settingNumber', () => {
  it('parses numbers and numeric strings and clamps to a range', () => {
    expect(settingNumber(4, 1)).toBe(4);
    expect(settingNumber('12', 1)).toBe(12);
    expect(settingNumber('abc', 7)).toBe(7);
    expect(settingNumber(99, 1, { min: 1, max: 12 })).toBe(12);
    expect(settingNumber(-5, 1, { min: 0 })).toBe(0);
  });
});
