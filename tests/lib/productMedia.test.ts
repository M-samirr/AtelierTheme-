import { describe, it, expect } from 'vitest';
import {
  galleryItems,
  indexFromScroll,
  lazyIframes,
  slideForOption,
} from '../../app/lib/productMedia';

describe('galleryItems', () => {
  it('sorts each entry into a kind', () => {
    const items = galleryItems({
      image: { url: '/main.jpg' },
      images: [
        { id: 1, url: '/a.jpg' },
        { id: 2, url: '/p.jpg', video_url: 'https://youtu.be/aqz-KE-bpKQ', video_type: 'youtube' },
        { id: 3, url: '/q.jpg', video_url: 'https://cdn/x.mp4', video_type: 'video' },
        { id: 4, url: '/r.jpg', three_d_image_url: 'https://cdn/x.glb' },
      ],
    } as never);
    expect(items.map((item) => item.kind)).toEqual(['image', 'youtube', 'video', 'model']);
    expect(items[1]?.videoId).toBe('aqz-KE-bpKQ');
  });

  it('falls back to the main image and drops entries with nothing to show', () => {
    expect(galleryItems({ image: { url: '/main.jpg' } } as never)).toHaveLength(1);
    expect(galleryItems({ images: [{ id: 1 }] } as never)).toEqual([]);
    expect(galleryItems({} as never)).toEqual([]);
  });
});

describe('slideForOption', () => {
  const items = galleryItems({
    images: [
      { id: 10, url: '/a' },
      { id: 20, url: '/b' },
    ],
  } as never);

  it('finds the image by either field', () => {
    expect(slideForOption(items, { option_value: 20 })).toBe(1);
    expect(slideForOption(items, { option_value: 'red', color: '10' })).toBe(0);
  });

  it('answers -1 when the option has no image', () => {
    expect(slideForOption(items, { color: '#ff0000' })).toBe(-1);
    expect(slideForOption(items, { option_value: 99 })).toBe(-1);
    expect(slideForOption(items, undefined)).toBe(-1);
  });
});

describe('indexFromScroll', () => {
  it('reads both directions and stays in range', () => {
    expect(indexFromScroll(400, 400, 3)).toBe(1);
    expect(indexFromScroll(-800, 400, 3)).toBe(2);
    expect(indexFromScroll(-9000, 400, 3)).toBe(2);
    expect(indexFromScroll(10, 0, 3)).toBe(0);
  });
});

describe('lazyIframes', () => {
  it('adds lazy loading and respects the merchant', () => {
    expect(lazyIframes('<iframe src="a>b"></iframe>')).toBe(
      '<iframe loading="lazy" src="a>b"></iframe>'
    );
    expect(lazyIframes('<iframe loading="eager"></iframe>')).toBe(
      '<iframe loading="eager"></iframe>'
    );
  });
});
