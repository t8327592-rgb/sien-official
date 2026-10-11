'use strict';

// Temporary mitigation for GHSA-vfj7-8cjw-p6xm, until braces ships a fix.
// Parent/prev links intentionally aren't visited: they refer back into the AST.
const MAX_DEPTH = 128;

function assertDepth(depth) {
  if (depth > MAX_DEPTH) {
    throw new SyntaxError(`Brace nesting exceeds safe depth limit (${MAX_DEPTH})`);
  }
}

function assertAstDepth(ast) {
  const pending = [{ node: ast, depth: 1 }];
  const seen = new WeakSet();
  while (pending.length) {
    const { node, depth } = pending.pop();
    assertDepth(depth);
    if (!node || typeof node !== 'object') throw new TypeError('Expected a brace AST node');
    if (seen.has(node)) throw new SyntaxError('Brace AST must be a tree');
    seen.add(node);
    if (node.nodes) {
      for (const child of node.nodes) pending.push({ node: child, depth: depth + 1 });
    }
  }
}

module.exports = { assertDepth, assertAstDepth };
