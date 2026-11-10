// @vitest-environment node
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import * as sass from 'sass';
import postcss, { type Root } from 'postcss';

const themeRoot = fileURLToPath(new URL('../../', import.meta.url));

function compile(file: string): Root {
  const { css } = sass.compile(`${themeRoot}app/styles/${file}`);
  return postcss.parse(css);
}

/** Every declaration of the top-level rules matching `selector`, as `prop: value`. */
function declsFor(root: Root, selector: string): Record<string, string> {
  const decls: Record<string, string> = {};
  root.walkRules((rule) => {
    if (rule.parent?.type !== 'root' || !rule.selectors.includes(selector)) return;
    rule.each((node) => {
      if (node.type === 'decl') decls[node.prop] = node.value;
    });
  });
  return decls;
}

describe('design tokens', () => {
  const root = compile('01-settings/_tokens.scss');
  const vars = declsFor(root, ':root');

  it('derive the brand colours from the merchant variables the engine sets', () => {
    expect(vars['--at-primary']).toMatch(/^var\(--color-primary,/);
    expect(vars['--at-on-primary']).toMatch(/^var\(--color-primary-reverse,/);
    expect(vars['--at-font-body']).toMatch(/^var\(--font-main,/);
  });

  it('expose the token families Tailwind maps', () => {
    for (const name of [
      '--at-canvas',
      '--at-surface',
      '--at-ink',
      '--at-ink-2',
      '--at-line',
      '--at-danger',
      '--at-radius-md',
      '--at-shadow-md',
      '--at-duration',
      '--at-ease-out',
      '--at-gutter',
      '--at-container',
      '--at-z-modal',
    ]) {
      expect(vars[name], name).toBeTruthy();
    }
  });

  it('feed the web components their single radius token', () => {
    expect(vars['--s-radius']).toBe('var(--at-radius-md)');
  });

  it('do not turn the store dark when the merchant primary colour is dark', () => {
    expect(declsFor(root, 'body.color-mode-dark')).toEqual({});
  });
});

describe('direction rules', () => {
  const root = compile('02-generic/_direction.scss');

  it('mirror Arabic-pointing icons in LTR and the engine breadcrumb arrow', () => {
    // Sass drops the quotes around simple attribute values.
    expect(declsFor(root, '[dir=ltr] .at-flip-ltr').transform).toBe('scaleX(-1)');
    expect(declsFor(root, '[dir=rtl] .at-flip-rtl').transform).toBe('scaleX(-1)');
    expect(declsFor(root, '[dir=ltr] .s-breadcrumb-arrow svg').transform).toBe('scaleX(-1)');
  });
});

describe('stylesheet order', () => {
  it('keeps the critical sheets a prefix-ordered subset of app.scss', async () => {
    const { readFileSync } = await import('node:fs');
    const imports = (file: string) =>
      [
        ...readFileSync(`${themeRoot}app/styles/${file}`, 'utf8').matchAll(/@import '([^']+)'/g),
      ].map((m) => m[1]);
    const full = imports('app.scss');
    for (const critical of ['critical.scss', 'critical-product.scss']) {
      const subset = imports(critical);
      const positions = subset.map((entry) => full.indexOf(entry));
      expect(positions, `${critical} imports a file app.scss lacks`).not.toContain(-1);
      expect(positions, `${critical} order differs from app.scss`).toEqual(
        [...positions].sort((a, b) => a - b)
      );
    }
  });
});
