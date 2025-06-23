/* ────────────────────────────────────────────────────────────────
   STAGE 2 — operator-core.js
   Refactored from: operator-framework.js
   Purpose: Provide isolated instruction registries and execution logic
            for each quadtree cell via x#-indexed modules.
   ───────────────────────────────────────────────────────────── */

export class x39 {                             // InstructionKernel
  constructor(cellPath) {
    this.x40 = cellPath;                      // path (e.g. [0,3,1])
    this.x41 = new Map();                     // registry: Map<opcode, {fn, doc}>
    this.x42 = {};                            // context: per-cell memory store
    this.x43 = [];                            // execution log
  }

  /** Register an opcode into the local registry */
  x44(opcode, fn, doc = '') {                 // register()
    if (this.x41.has(opcode)) {
      this.x46(`Opcode ${opcode} already exists — skipping`);
      return false;
    }
    this.x41.set(opcode, { fn, doc });
    return true;
  }

  /** List available opcodes in a string array */
  x45() {                                     // listOpcodes()
    return [...this.x41.entries()]
      .map(([code, {fn, doc}]) =>
        `${code}: ${fn.name || 'anon'} - ${doc}`
      )
      .sort((a, b) => parseInt(a) - parseInt(b));
  }

  /** Append to execution log */
  x46(msg) {                                  // log()
    const prefix = `[/${this.x40.join('/')}] `;
    this.x43.push(prefix + msg);
    console.log(prefix + msg);  // also echo to console
  }

  /** Execute one instruction: {code, args, file, line} */
  async x47(instr) {                          // execute()
    const { code, args, file = 'inline', line = 0 } = instr;
    const entry = this.x41.get(code);
    if (!entry) return this.x46(`Unknown opcode ${code} at ${file}:${line}`);

    let parsed;
    try {
      parsed = this.x48(args);
    } catch (e) {
      return this.x46(`! Failed to parse args: ${e.message}`);
    }

    this.x46(`→ [${file}:${line}] ${code}, args=${JSON.stringify(parsed)}`);
    try {
      const result = await entry.fn(parsed, this.x42);
      this.x46(`← ${code} returned ${JSON.stringify(result)}`);
      return result;
    } catch (e) {
      this.x46(`! Error in opcode ${code}: ${e.message}`);
    }
  }

  /** Parse argument string into JS object */
  x48(raw) {                                  // parseArgs()
    const t = raw?.trim();
    if (!t) return {};
    if (t.startsWith('{') && t.endsWith('}')) return JSON.parse(t);

    if (t.includes('=') && t.includes(',')) {
      const obj = {};
      t.split(',').forEach(pair => {
        const [k, v] = pair.split('=');
        let val = v.trim();
        if (/^-?\d+$/.test(val)) val = parseInt(val);
        else if (/^-?\d+\.\d+$/.test(val)) val = parseFloat(val);
        else if (val.toLowerCase() === 'true') val = true;
        else if (val.toLowerCase() === 'false') val = false;
        obj[k.trim()] = val;
      });
      return obj;
    }

    return t; // fallback: raw string
  }

  /** Bulk run from parsed sequences */
  async x49(seq = [], mode = 'sequential') {  // runSequence()
    if (mode === 'parallel') {
      await Promise.all(seq.map(instr => this.x47(instr)));
    } else {
      for (const instr of seq) await this.x47(instr);
    }
  }

  /** Parse a raw sequence file into [{code, args, file, line}] */
  x50(text, filename='inline') {              // parseSequenceFile()
    const lines = text.split(/\r?\n/);
    const seq = [];
    let curCode = null, curArgs = [], curLine = 0;

    lines.forEach((raw, idx) => {
      const ln = raw.split('#')[0].trimEnd();
      if (!ln) return;
      const m = ln.match(/^(\d+)(?:\s+(.*))?$/);
      if (m) {
        if (curCode !== null) {
          seq.push({ code: curCode, args: curArgs.join('\n'), file: filename, line: curLine });
        }
        curCode = parseInt(m[1], 10);
        curArgs = [m[2] || ''];
        curLine = idx + 1;
      } else if (curCode !== null) {
        curArgs.push(ln);
      }
    });

    if (curCode !== null) {
      seq.push({ code: curCode, args: curArgs.join('\n'), file: filename, line: curLine });
    }

    return seq;
  }

  /** Inject standard opcodes into the cell registry */
  x51() {                                      // loadBuiltins()
    this.x44(1, (p) => { this.x46(`>> ${p}`); return p; }, 'Print a message');
    this.x44(2, ({a,b,operation='add'}) => {
      const ops = { add: (x,y)=>x+y, subtract: (x,y)=>x-y, multiply: (x,y)=>x*y, divide: (x,y)=>y?x/y:'div0' };
      const r = ops[operation]?.(a,b);
      this.x46(`Calc: ${a} ${operation} ${b} = ${r}`);
      return r;
    }, 'Math ops');
    this.x44(3, async(p) => { this.x46(`Waiting ${p}ms`); await new Promise(r=>setTimeout(r,p)); return 'done'; }, 'Sleep');
    this.x44(10, ({key,value},ctx) => { ctx[key] = value; this.x46(`Stored ${key}=${value}`); return value; }, 'Store');
    this.x44(11, ({key},ctx) => { const v=ctx[key]; this.x46(`Got ${key}=${v}`); return v; }, 'Retrieve');
    this.x44(12, (_,ctx) => { this.x46('Ctx='+JSON.stringify(ctx)); return ctx; }, 'Dump context');
    this.x44(99, () => { this.x45().forEach(this.x46.bind(this)); return true; }, 'Show help');
  }

  /** Get full log history */
  x52() { return [...this.x43]; }             // getLog()
}
