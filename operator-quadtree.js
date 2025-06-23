/* ────────────────────────────────────────────────────────────────
   Stage 1 — Quadtree bootstrap wrapper
   Injected on top of the *existing* Operator codebase.
   All identifiers follow the incremental “x#” naming scheme.
   ───────────────────────────────────────────────────────────── */

//////////////////// ① Core data structures ////////////////////

export class x22 {                           // OperatorKernel
  /** @param {{rootEl:HTMLElement}} opts */
  constructor (opts) {
    this.x25 = opts.rootEl;                 // DOM mount‑point
    this.x26 = new Map();                   // shared module registry
    this.x27 = {                            // static config
      splitKey  : {key:'Q', ctrlKey:true, shiftKey:true}, // Ctrl+Shift+Q
      activeCss : 'x32'
    };
    this.x28 = null;                        // current active QCell
    this.x29 = null;                        // root QCell
    this.#initListeners();
  }

  /* public ---------------------------------------------------- */

  /** Dynamically import legacy extensions (.js files) once */
  async x30 (urls = []) {                   // loadExtensions
    for (const u of urls) {
      const m = await import(u);
      this.x26.set(u, m.default ?? m);
    }
  }

  /** Build root cell and show UI */
  x31 () {                                  // init()
    this.x29 = new x23({                    // new QCell
      path   : [],
      parent : null,
      kernel : this
    });
    this.x29.x34();                         // mount()
    this.x28 = this.x29;
  }

  /* private --------------------------------------------------- */

  #initListeners () {
    window.addEventListener('keydown', (ev)=>{
      const k = this.x27.splitKey;
      if (ev.key===k.key && ev.ctrlKey===k.ctrlKey && ev.shiftKey===k.shiftKey) {
        ev.preventDefault();
        this.x28?.x35();                    // split()
      }
    });
  }
}

export class x23 {                           // QCell
  /** @param {{path:number[],parent:x23|null,kernel:x22}} opts */
  constructor (opts) {
    Object.assign(this, opts);
    this.x32 = document.createElement('div');  // domNode
    this.x32.className = 'x31';               // common cell style
    this.x33 = null;                          // current Renderer
    this.children = null;
  }

  /** Create DOM node and attach to the page */
  x34 () {                                    // mount()
    const host = this.parent ? this.parent.x32 : this.kernel.x25;
    host.appendChild(this.x32);
    this.#applyLayout();
    // load default Renderer from legacy operator UI
    this.x33 = new x24(this);
    this.x33.x36();                           // renderer.mount()
    this.x32.addEventListener('click', ()=> this.kernel.x28=this);
  }

  /** Split this cell into four children (lazy) */
  x35 () {                                    // split()
    if (this.children) return;                // already split
    this.children = [0,1,2,3].map(i=> new x23({
      path   : [...this.path, i],
      parent : this,
      kernel : this.kernel
    }));
    // repurpose current content as child 0
    this.x33?.x37();                          // renderer.unmount()
    this.x32.innerHTML = '';                  // clear
    this.children.forEach(c=>c.x34());
  }

  /* ----------------------------------------------------------- */
  #applyLayout () {                           // compute CSS rect
    const r = this.path.reduce((rect, idx)=>{
      const {x,y,w,h} = rect, hw=w/2, hh=h/2;
      return [
        {x:x+hw, y:y,    w:hw, h:hh},  // 0 = NE
        {x:x,    y:y,    w:hw, h:hh},  // 1 = NW
        {x:x,    y:y+hh, w:hw, h:hh},  // 2 = SW
        {x:x+hw, y:y+hh, w:hw, h:hh}   // 3 = SE
      ][idx];
    }, {x:0,y:0,w:100,h:100});
    Object.assign(this.x32.style, {
      position:'absolute',
      left   : r.x+'%',
      top    : r.y+'%',
      width  : r.w+'%',
      height : r.h+'%'
    });
  }
}

/* ───────────── ② Minimal Renderer proxy to legacy UI ────────── */

class x24 {                                   // LegacyRendererProxy
  /** @param {x23} cell */
  constructor (cell){ this.cell=cell; }

  /* Mount: clone the existing operator root UI into this cell */
  x36 () {                                    // mount()
    // Grab everything that operator.html originally rendered
    // and transplant it into this cell’s DOM node.
    const legacyRoot = document.querySelector('.x19') ??
                       document.body.firstElementChild;
    if (legacyRoot) {
      this._clone = legacyRoot.cloneNode(true);
      this.cell.x32.appendChild(this._clone);
    }
  }

  /* Optional un‑mount when the cell is split */
  x37 () {                                    // unmount()
    this._clone?.remove();
  }
}

/* ───────────── ③ Boot sequence ───────────── */

const x38 = new x22({rootEl: document.body});     // kernel
// optional: preload operator‑extensions here  ≫ x38.x30([...])
x38.x31();                                        // build root
