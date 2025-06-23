/* ────────────────────────────────────────────────────────────────
   STAGE 5 — operator-map.js
   Purpose: Transform charset engine into Renderer module
   Symbols: x80–x99
   ───────────────────────────────────────────────────────────── */

export class x80 {                                // MapRenderer
  /** @param {x23} cell */
  constructor(cell) {
    this.x81 = cell;                              // cell ref
    this.x82 = [];                                // current charset
    this.x83 = document.createElement('div');     // container
    this.x83.className = 'x82';                   // style class
  }

  x84() {                                         // mount()
    this.x81.x32.innerHTML = '';                 // wipe
    this.x81.x32.appendChild(this.x83);
    this.x85();                                   // styles
    this.x86();                                   // render UI
    this.x87();                                   // bind events
    this.x88();                                   // init charset
  }

  x85() {                                         // styles
    const s = document.createElement('style');
    s.textContent = `
    .x82 {
      font-family: monospace;
      padding: 10px;
      background: #fffdf7;
      color: #222;
    }
    .x82 h2 { margin-top: 0; }
    .x82 input, .x82 textarea, .x82 select {
      width: 100%;
      margin-top: 5px;
      margin-bottom: 10px;
      font-family: monospace;
    }
    .x82 button {
      padding: 6px 10px;
      background: #4B5320;
      color: white;
      border: none;
      margin-top: 5px;
    }
    .x82 button:hover {
      background: #6a7f2c;
    }
    `;
    document.head.appendChild(s);
  }

  x86() {                                         // render UI
    this.x83.innerHTML = `
      <h2>Charset & String ID</h2>
      <label>Input String</label>
      <textarea id="x89" rows="4" placeholder="Type something…"></textarea>
      <button id="x90">Calculate ID</button>
      <p id="x91"></p>
      
      <label>Decode ID</label>
      <input id="x92" placeholder="Enter numeric ID">
      <button id="x93">Decode</button>
      <p id="x94"></p>
    `;
  }

  x87() {                                         // bind events
    this.x83.querySelector('#x90').onclick = () => {
      const text = this.x83.querySelector('#x89').value;
      const id = this.x95(text);
      this.x83.querySelector('#x91').textContent = `ID: ${id}`;
    };

    this.x83.querySelector('#x93').onclick = () => {
      const raw = this.x83.querySelector('#x92').value;
      try {
        const id = BigInt(raw);
        const decoded = this.x96(id);
        this.x83.querySelector('#x94').textContent = `Decoded: ${decoded}`;
      } catch (e) {
        this.x83.querySelector('#x94').textContent = 'Invalid ID';
      }
    };
  }

  x88() {                                         // initCharset()
    this.x82 = [];
    const ranges = [
      [0x0020, 0x007F], // Basic Latin
      [0x00A0, 0x00FF], // Latin-1
      [0x2200, 0x22FF]  // Math ops
    ];
    ranges.forEach(([a, b]) => {
      for (let i = a; i <= b; i++) {
        this.x82.push(String.fromCharCode(i));
      }
    });
    this.x82.push('\n');
    this.x82.push('\t');
  }

  x95(s) {                                         // encodeStringToID()
    let id = 0n;
    const k = BigInt(this.x82.length);
    for (const ch of s) {
      const idx = this.x82.indexOf(ch);
      if (idx === -1) throw new Error(`Invalid char: ${ch}`);
      id = id * k + BigInt(idx);
    }
    return id;
  }

  x96(id) {                                        // decodeIDToString()
    let result = '';
    const k = BigInt(this.x82.length);
    while (id > 0n) {
      const idx = id % k;
      result = this.x82[Number(idx)] + result;
      id = id / k;
    }
    return result;
  }

  x97() { }                                        // unmount() — optional
}
