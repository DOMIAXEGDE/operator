/* ────────────────────────────────────────────────────────────────
   STAGE 6 — operator-alphabet.js
   Purpose: Tile Color Viewer (grid renderer)
   Symbols: x100–x119
   ───────────────────────────────────────────────────────────── */

export class x100 {                                   // GridRenderer
  /** @param {x23} cell */
  constructor(cell) {
    this.x101 = cell;                                 // cell ref
    this.x102 = [];                                   // grid array of color codes
    this.x103 = 0;                                    // current index
    this.x104 = document.createElement('div');        // container
    this.x104.className = 'x104';
  }

  x105() {                                            // mount()
    this.x101.x32.innerHTML = '';
    this.x101.x32.appendChild(this.x104);
    this.x106();                                      // style
    this.x107();                                      // layout
    this.x108();                                      // events
    this.x109();                                      // load default
  }

  x106() {                                            // styles
    const css = document.createElement('style');
    css.textContent = `
    .x104 { font-family: monospace; padding: 10px; }
    .x104 canvas { border: 1px solid #ccc; display: block; margin: 10px 0; }
    .x104 button { margin-right: 5px; }
    `;
    document.head.appendChild(css);
  }

  x107() {                                            // layout
    this.x104.innerHTML = `
      <h2>Tile Grid Viewer</h2>
      <div>
        <textarea id="x110" rows="2" placeholder="Enter compounded ID"></textarea>
        <button id="x111">Generate</button>
      </div>
      <canvas id="x112" width="300" height="300"></canvas>
      <div>
        <button id="x113">Prev</button>
        <button id="x114">Next</button>
        <span id="x115"></span>
      </div>
    `;
  }

  x108() {                                            // events
    this.x104.querySelector('#x111').onclick = () => {
      const raw = this.x104.querySelector('#x110').value.trim();
      const grid = this.x116(raw);
      if (grid.length > 0) {
        this.x102 = [grid];
        this.x103 = 0;
        this.x117();
      }
    };
    this.x104.querySelector('#x113').onclick = () => {
      if (this.x103 > 0) {
        this.x103--;
        this.x117();
      }
    };
    this.x104.querySelector('#x114').onclick = () => {
      if (this.x103 < this.x102.length - 1) {
        this.x103++;
        this.x117();
      }
    };
  }

  x109() {                                            // default grid
    const defaultID = '1443664';
    const grid = this.x116(defaultID);
    this.x102 = [grid];
    this.x103 = 0;
    this.x117();
  }

  x116(compoundedID) {                                // decodeToGrid()
    const tiles = [];
    for (let i = 0; i < compoundedID.length; i += 7) {
      const part = compoundedID.slice(i, i + 7);
      const id = parseInt(part, 10);
      const hex = `#${(id - 1).toString(16).padStart(6, '0')}`;
      tiles.push(hex);
    }
    return tiles;
  }

  x117() {                                            // draw()
    const canvas = this.x104.querySelector('#x112');
    const ctx = canvas.getContext('2d');
    const grid = this.x102[this.x103];
    const size = 40;
    const cols = Math.ceil(Math.sqrt(grid.length));
    const rows = Math.ceil(grid.length / cols);
    canvas.width = cols * size;
    canvas.height = rows * size;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid.forEach((color, i) => {
      const x = (i % cols) * size;
      const y = Math.floor(i / cols) * size;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, size, size);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(x, y, size, size);
    });

    this.x104.querySelector('#x115').textContent = `Grid ${this.x103 + 1} / ${this.x102.length}`;
  }

  x118() {}                                            // unmount()
}
