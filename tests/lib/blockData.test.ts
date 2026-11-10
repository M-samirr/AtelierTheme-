import { describe, it, expect } from 'vitest';
import {
  blockLimit,
  items,
  linkUrl,
  pickIds,
  pickValue,
  productSource,
  youtubeId,
} from '../../app/lib/blockData';
import { paragraphs, plainText } from '../../app/lib/text';
import { parseEndDate, partsUntil } from '../../app/hooks/useCountdown';

describe('pickers', () => {
  it('reads ids from every shape the dashboard sends', () => {
    expect(pickIds([1, '2', { id: 3 }, { value: '4' }])).toEqual([1, 2, 3, 4]);
    expect(pickIds({ source_value: [5] })).toEqual([5]);
    expect(pickIds(6)).toEqual([6]);
    expect(pickIds(null)).toEqual([]);
    expect(pickIds(['abc'])).toEqual([]);
  });

  it('prefers the numeric id over the hashed one on categories', () => {
    expect(pickIds([{ id: 'QlayPG', id_: 1309167683 }])).toEqual([1309167683]);
  });

  it('reads a dropdown value', () => {
    expect(pickValue('sales')).toBe('sales');
    expect(pickValue([{ value: 'sales', label: 'x' }])).toBe('sales');
    expect(pickValue(undefined)).toBe('');
  });
});

describe('linkUrl', () => {
  it('reads strings and objects and drops dead links', () => {
    expect(linkUrl('/a')).toBe('/a');
    expect(linkUrl({ url: '/b' })).toBe('/b');
    expect(linkUrl([{ value: '/c' }])).toBe('/c');
    expect(linkUrl('#')).toBe('');
    expect(linkUrl(null)).toBe('');
  });
});

describe('items', () => {
  it('strips the collection prefix from field names', () => {
    expect(items([{ 'tabs.label': 'A' }, { label: 'B' }])).toEqual([
      { label: 'A' },
      { label: 'B' },
    ]);
    expect(items('nope')).toEqual([]);
  });
});

describe('blockLimit', () => {
  it('accepts whole numbers up to 24', () => {
    expect(blockLimit('6', 8)).toBe(6);
    expect(blockLimit(100, 8)).toBe(24);
    expect(blockLimit(0, 8)).toBe(8);
    expect(blockLimit('x', 8)).toBe(8);
  });
});

describe('productSource', () => {
  it('maps each kind to a list request', () => {
    expect(productSource('latest', {})).toEqual({ source: 'latest' });
    expect(productSource('top_rated', {})).toEqual({ source: 'top-rated' });
    expect(productSource('category', { category: [{ id: 9 }] })).toEqual({
      source: 'categories',
      sourceValue: [9],
    });
  });

  it('asks for nothing until a required pick is made', () => {
    expect(productSource('selected', { products: [] })).toBeNull();
    expect(productSource('tag', {})).toBeNull();
  });
});

describe('youtubeId', () => {
  it('reads links and bare ids', () => {
    expect(youtubeId('https://www.youtube.com/watch?v=aqz-KE-bpKQ')).toBe('aqz-KE-bpKQ');
    expect(youtubeId('https://youtu.be/aqz-KE-bpKQ')).toBe('aqz-KE-bpKQ');
    expect(youtubeId('aqz-KE-bpKQ')).toBe('aqz-KE-bpKQ');
    expect(youtubeId('no good!')).toBe('');
    expect(youtubeId(undefined)).toBe('');
  });
});

describe('text', () => {
  it('strips tags and decodes entities', () => {
    expect(plainText('<p>Hello&nbsp;<b>world</b> &amp; co</p>')).toBe('Hello world & co');
    expect(plainText(null)).toBe('');
  });

  it('splits a textarea into paragraphs', () => {
    expect(paragraphs('a\n\n b \r\nc')).toEqual(['a', 'b', 'c']);
  });
});

describe('countdown', () => {
  it('splits a span into units and never goes negative', () => {
    const start = 0;
    expect(partsUntil(start + 90061000, start)).toEqual({
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 1,
    });
    expect(partsUntil(0, 5000).seconds).toBe(0);
  });

  it('parses the format the merchant is told to use', () => {
    expect(parseEndDate('2026-12-31 23:59')).toBe(Date.parse('2026-12-31T23:59'));
    expect(parseEndDate('someday')).toBeNull();
    expect(parseEndDate('')).toBeNull();
  });
});
