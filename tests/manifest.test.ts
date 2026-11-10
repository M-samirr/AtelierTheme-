// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import ar from '../locales/ar.json';
import en from '../locales/en.json';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(readFileSync(join(root, 'twilight.json'), 'utf8'));

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) && !name.endsWith('routeTree.gen.ts') ? [path] : [];
  });
}

const sources = sourceFiles(join(root, 'app')).map((file) => readFileSync(file, 'utf8'));
const homeIndex = readFileSync(join(root, 'app/components/home/index.tsx'), 'utf8');

describe('home blocks', () => {
  const paths: string[] = manifest.components.map((block: { path: string }) =>
    block.path.replace(/^home\./, '')
  );

  it('registers a component and a reserved height for every declared block', () => {
    for (const path of paths) {
      expect(homeIndex, `${path} is not registered`).toMatch(new RegExp(`'?${path}'?:\\s+[A-Z]`));
      expect(homeIndex, `${path} has no reserved height`).toMatch(new RegExp(`'?${path}'?: '`));
    }
  });

  it('keeps block keys unique', () => {
    const keys = manifest.components.map((block: { key: string }) => block.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('titles every block in both languages', () => {
    for (const block of manifest.components) {
      expect(block.title.ar, block.path).toBeTruthy();
      expect(block.title.en, block.path).toBeTruthy();
    }
  });

  it('offers no field a merchant could put HTML into', () => {
    const fields = JSON.stringify(manifest.components);
    expect(fields).not.toMatch(/"format":"(html|code|rich-?text)"/);
  });
});

describe('translations', () => {
  const used = new Set(
    sources.flatMap((source) =>
      [...source.matchAll(/\bt\(\s*'((?:theme|common)\.[\w.]+)'/g)].map((match) => match[1])
    )
  );

  it('defines every key the theme uses in both languages', () => {
    expect(used.size).toBeGreaterThan(30);
    for (const key of used) {
      expect(ar, `ar lacks ${key}`).toHaveProperty([key]);
      expect(en, `en lacks ${key}`).toHaveProperty([key]);
    }
  });

  it('keeps the two locale files in step', () => {
    expect(Object.keys(ar).sort()).toEqual(Object.keys(en).sort());
  });
});

describe('review rules', () => {
  // The review rule is about settings and blocks. A product description is written in Salla's own
  // editor and the engine renders it as HTML too, so it is the one allowed use.
  it('renders HTML only for the product description', () => {
    const withHtml = sources.filter((source) => source.includes('dangerouslySetInnerHTML'));
    expect(withHtml).toHaveLength(1);
    expect(withHtml[0]).toContain('lazyIframes((product.description');
  });

  it('never touches document.cookie or fetches off-platform', () => {
    for (const source of sources) {
      expect(source).not.toContain('document.cookie');
      expect(source).not.toMatch(/\bfetch\(/);
    }
  });
});
