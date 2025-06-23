/* ────────────────────────────────────────────────────────────────
   STAGE 3 — operator-language.js (rewired as modular extension)
   Purpose: Provide lightweight tokenizer + evaluator functions
   Symbols: x60–x67
   ───────────────────────────────────────────────────────────── */

export const x60 = function tokenize(src = '') {    // tokenize()
  const tokens = [];
  const re = /\s*(=>|==|!=|[\(\)\{\}\[\];,]|[-+*/%<>=]|"(?:\\.|[^"])*"|\d+\.?\d*|\w+)\s*/g;
  let match;
  while ((match = re.exec(src)) !== null) {
    tokens.push(match[1]);
  }
  return tokens;
};

export const x61 = function classify(tok) {         // tokenType()
  if (!tok) return 'unknown';
  if (/^\d+(\.\d+)?$/.test(tok)) return 'number';
  if (/^".*"$/.test(tok)) return 'string';
  if (/^[\+\-\*\/\%\=<>!]+$/.test(tok)) return 'operator';
  if (/^[a-zA-Z_]\w*$/.test(tok)) return 'identifier';
  if (/^[\(\)\{\}\[\];,]$/.test(tok)) return 'symbol';
  return 'unknown';
};

export const x62 = function buildAST(tokens = []) { // buildAST()
  const nodes = [];
  for (let i = 0; i < tokens.length; i++) {
    const type = x61(tokens[i]);
    nodes.push({ value: tokens[i], type });
  }
  return nodes;
};

export const x63 = function evalExpr(expr) {        // evalExpr()
  try {
    return Function('"use strict";return(' + expr + ')')();
  } catch (e) {
    return `⚠️ ${e.message}`;
  }
};

export const x64 = function parseNum(val) {         // parseNum()
  if (typeof val === 'number') return val;
  if (/^-?\d+$/.test(val)) return parseInt(val, 10);
  if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val);
  return NaN;
};

export const x65 = function highlight(tokens = []) {// highlightTokens()
  return tokens.map(tok => {
    const cls = x61(tok);
    return `<span class="tok-${cls}">${tok}</span>`;
  }).join(' ');
};

export const x66 = function formatAST(ast = []) {   // formatAST()
  return ast.map(n => `[${n.type}] ${n.value}`).join('\n');
};

export const x67 = function injectInto(xKernel) {   // installInto(kernel)
  xKernel.x44(100, ({code}) => {
    const result = x63(code);
    xKernel.x46(`eval> ${code} → ${result}`);
    return result;
  }, 'Evaluate JS expression');

  xKernel.x44(101, ({code}) => {
    const tokens = x60(code);
    const ast = x62(tokens);
    xKernel.x46(`tokens> ${tokens.join(' ')}`);
    xKernel.x46(`ast> ${formatAST(ast)}`);
    return ast;
  }, 'Tokenize & format input');

  xKernel.x44(102, ({value}) => {
    const num = x64(value);
    xKernel.x46(`parsed number: ${value} → ${num}`);
    return num;
  }, 'Parse number string');
};
