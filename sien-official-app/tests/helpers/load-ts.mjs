import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { createRequire } from 'node:module';
const cache = new Map();
// Test-only TS loader, including relative modules and the application's alias.
export function load(file) {
  const full = path.resolve(file);
  if (cache.has(full)) return cache.get(full).exports;
  const loaded = { exports: {} }; cache.set(full, loaded);
  const compiled = ts.transpileModule(fs.readFileSync(full, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const requireHere = createRequire(full);
  const localRequire = specifier => {
    const target = specifier.startsWith('@/') ? path.resolve(import.meta.dirname, '../../src', specifier.slice(2)) : specifier.startsWith('.') ? path.resolve(path.dirname(full), specifier) : null;
    if (target && fs.existsSync(target + '.ts')) return load(target + '.ts');
    return requireHere(specifier);
  };
  new Function('module', 'exports', 'require', compiled)(loaded, loaded.exports, localRequire);
  return loaded.exports;
}
