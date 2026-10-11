import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Do not change dependency versions/advisory metadata to hide npm audit results.
// Validate exact upstream sources and install an idempotent, reviewable depth guard.
const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hashes = {
  parse: 'e572166565f15fa6ad9865ae49d678218e32aabfd1b3720f6d0d43d39800d310',
  compile: 'dc98f22eee3d511785d92a00758d5f0d48efed5f5813bdecc2de430c529b5c9f',
  expand: '41ccc196ebfa7b7781a634e721eb744e4e7bcb54cba427a7e3d6806a1b9e58f7',
  stringify: '379f22d77bfa1478341ccd49c5e4267464aabcbba03558bab332aac23fc6f23a',
};
const guard = fs.readFileSync(path.join(app, 'scripts/braces-depth-guard.cjs'), 'utf8');
const sha = source => createHash('sha256').update(source).digest('hex');

function patchSource(name, source) {
  const declaration = name === 'parse'
    ? "const { assertDepth } = require('./sien-depth-guard');"
    : "const { assertAstDepth } = require('./sien-depth-guard');";
  let patched = source.replace("'use strict';", `'use strict';\n\n${declaration}`);
  if (name === 'parse') {
    for (const character of ['CHAR_LEFT_PARENTHESES', 'CHAR_LEFT_CURLY_BRACE']) {
      const opening = `if (value === ${character}) {`;
      patched = patched.replace(opening, `${opening}\n      assertDepth(stack.length + 1);`);
    }
  } else {
    const opening = name === 'stringify' ? 'module.exports = (ast, options = {}) => {' : `const ${name} = (ast, options = {}) => {`;
    patched = patched.replace(opening, `${opening}\n  assertAstDepth(ast);`);
  }
  return patched;
}

function patch(directory) {
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
  if (manifest.version !== '3.0.3') throw new Error('Review braces depth patch for the new upstream version before installing.');
  const changes = Object.entries(hashes).map(([name, expected]) => {
    const file = path.join(directory, 'lib', `${name}.js`);
    const current = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    if (sha(current) === expected) return { file, content: patchSource(name, current) };
    const declaration = name === 'parse'
      ? "\n\nconst { assertDepth } = require('./sien-depth-guard');"
      : "\n\nconst { assertAstDepth } = require('./sien-depth-guard');";
    const original = current.replace(declaration, '').replace(/\n      assertDepth\(stack.length \+ 1\);/g, '').replace(/\n  assertAstDepth\(ast\);/g, '');
    if (sha(original) !== expected || current !== patchSource(name, original)) {
      throw new Error(`Unexpected braces ${name} source; refusing an unreviewed patch.`);
    }
    return { file, content: current };
  });
  fs.writeFileSync(path.join(directory, 'lib/sien-depth-guard.js'), guard);
  for (const { file, content } of changes) fs.writeFileSync(file, content);
  console.log('Applied verified braces 3.0.3 nesting protection.');
}

function visit(modules) {
  if (!fs.existsSync(modules)) return;
  for (const entry of fs.readdirSync(modules, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const directory = path.join(modules, entry.name);
    if (entry.name.startsWith('@')) { visit(directory); continue; }
    if (entry.name === 'braces') patch(directory);
    visit(path.join(directory, 'node_modules'));
  }
}

visit(path.join(app, 'node_modules'));
