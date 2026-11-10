/**
 * Salla's marketplace caps a public theme at 1 MB (2 MB private), measured on
 * the source Salla pulls from the repository. This sums every tracked file and
 * fails when the cap is near, listing the largest files so the fix is obvious.
 *
 * Usage: node scripts/check-size.mjs [--limit=1000000]
 */
import { execSync } from 'node:child_process';
import { statSync } from 'node:fs';

const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const LIMIT = limitArg ? Number(limitArg.split('=')[1]) : 1_000_000;
const WARN_AT = LIMIT * 0.85;

// Tracked files plus new files not yet committed (ignored ones excluded).
const files = execSync('git ls-files -z --cached --others --exclude-standard', { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
  .map((file) => {
    try {
      return { file, size: statSync(file).size };
    } catch {
      return { file, size: 0 };
    }
  });

const total = files.reduce((sum, { size }) => sum + size, 0);
const largest = [...files].sort((a, b) => b.size - a.size).slice(0, 10);

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
console.log(`Tracked source: ${kb(total)} of ${kb(LIMIT)} allowed (${files.length} files)`);
console.log('Largest files:');
for (const { file, size } of largest) console.log(`  ${kb(size).padStart(10)}  ${file}`);

if (total > LIMIT) {
  console.error(`\n✗ Over the ${kb(LIMIT)} marketplace cap by ${kb(total - LIMIT)}.`);
  process.exit(1);
}
if (total > WARN_AT) {
  console.warn(`\n! Within 15% of the cap. Trim assets before adding more.`);
}
console.log('\n✓ Size within the marketplace cap.');
