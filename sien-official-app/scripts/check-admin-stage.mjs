import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const stage = process.argv[2];
if (!/^A(?:0[1-9]|1[0-4])$/.test(stage || '')) throw Error('Specify A01 through A14');
const root = path.resolve(import.meta.dirname, '..');
const dir = path.resolve(root, Number(stage.slice(1)) <= 7 ? '../audit/checks/admin-high-2026-10-11' : '../audit/checks/admin-followup-2026-10-11', stage);
fs.mkdirSync(dir, { recursive: true });
const result = { stage, checkedAt: new Date().toISOString(), checks: [] };
const checks = [
  ['build', ['node_modules/next/dist/bin/next', 'build']],
  ['typecheck', ['node_modules/typescript/bin/tsc', '--noEmit']],
  ['lint', ['node_modules/eslint/bin/eslint.js', '.', '--max-warnings=0']],
  ['regression', ['--test', 'tests/security.test.mjs']],
];
for (const [name, args] of checks) {
  const log = fs.openSync(path.join(dir, name + '.log'), 'w');
  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd: root, env: { ...process.env, QA_ISOLATED: '1' }, stdio: ['ignore', log, log], windowsHide: true });
    child.once('error', reject);
    child.once('exit', code => resolve(code));
  });
  fs.closeSync(log);
  result.checks.push({ name, exitCode });
  fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify(result, null, 2));
  console.log(stage, name, exitCode === 0 ? 'PASS' : 'FAIL');
  if (exitCode !== 0) { process.exitCode = 1; break; }
}
