/* ────────────────────────────────────────────────────────────────
   STAGE 4 — operator-systems.js
   Purpose: Replace dropdown manager with quadtree-friendly registry
   Symbols: x68–x79
   ───────────────────────────────────────────────────────────── */

export const x68 = function initSystemDropdown(hostId) {        // initialize
  const xContainer = document.getElementById(hostId);
  if (!xContainer) {
    console.error(`❌ No container with ID: ${hostId}`);
    return null;
  }

  if (x68._nav) {
    console.warn(`⚠️ Dropdown already initialized`);
    return x68;
  }

  x68._nav = xContainer;
  x68._systems = [];
  x68._active = null;
  x75(); // install styles

  const block = document.createElement('div');
  block.className = 'nav-section';
  block.innerHTML = `
    <h3>External Systems</h3>
    <div class="x70">
      <button class="x71">Select System</button>
      <div class="x72" id="x73">
        <div class="x74">No systems registered</div>
      </div>
    </div>
  `;
  xContainer.appendChild(block);

  return x68;
};

export const x69 = function addSystem(entry) {                  // addSystem
  const { id, name, description, loadFunction } = entry;
  if (!id || typeof loadFunction !== 'function') return false;
  if (x68._systems.some(s => s.id === id)) return false;

  const system = { id, name, description, loadFunction, isLoaded: false };
  x68._systems.push(system);
  const list = document.getElementById('x73');
  const empty = list.querySelector('.x74');
  if (empty) empty.remove();

  const btn = document.createElement('button');
  btn.className = 'x75';
  btn.id = `sys-${id}`;
  btn.dataset.systemId = id;
  btn.innerHTML = `${name} <span class="x76">${description}</span>`;
  btn.onclick = () => x70(id);
  list.appendChild(btn);

  return true;
};

export const x70 = function loadSystem(id) {                    // loadSystem
  const sys = x68._systems.find(s => s.id === id);
  if (!sys || sys.isLoaded) return false;

  try {
    sys.loadFunction();
    sys.isLoaded = true;
    x68._active = id;
    x79(id);
    return true;
  } catch (e) {
    console.error(`❌ Failed to load ${id}: ${e.message}`);
    return false;
  }
};

export const x71 = function unloadSystem() {                    // unloadActiveSystem
  if (!x68._active) return false;
  const sys = x68._systems.find(s => s.id === x68._active);
  if (!sys) return false;

  if (typeof sys.unloadFunction === 'function') {
    try { sys.unloadFunction(); } catch (e) {}
  }

  sys.isLoaded = false;
  x68._active = null;
  x79(null);
  return true;
};

export const x72 = function getActiveSystem() {                 // getActiveSystem
  return x68._active;
};

export const x73 = function listSystems() {                     // getAllSystems
  return [...x68._systems];
};

export const x74 = function isLoaded(id) {                      // isSystemLoaded
  const s = x68._systems.find(s => s.id === id);
  return !!(s && s.isLoaded);
};

export const x75 = function installCSS() {                      // _addDropdownStyles
  const style = document.createElement('style');
  style.textContent = `
  .x70 { position:relative; width:100%; }
  .x71 {
    width:100%; padding:10px; cursor:pointer;
    background-color: var(--primary-color); color:white;
    border:2px solid var(--secondary-color);
    font-family: var(--font-main);
  }
  .x72 {
    display:none; position:absolute; width:100%; background:white;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2); z-index:999;
  }
  .x70:hover .x72 { display:block; }
  .x75 {
    width:100%; text-align:left; padding:10px;
    background:white; border:none; cursor:pointer;
    border-bottom:1px solid #ddd;
    font-family: var(--font-main);
  }
  .x75:hover { background: #f5f5f5; }
  .x75.active { border-left: 5px solid var(--primary-color); background: #f9f9f9; font-weight: bold; }
  .x76 {
    display:block; font-size:0.8em; color:#555;
  }`;
  document.head.appendChild(style);
};

export const x76 = function search(query) {                     // searchSystems
  const q = query.toLowerCase();
  return x68._systems.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
};

export const x77 = function filter(query) {                     // filterDropdown
  const match = x76(query);
  const list = document.getElementById('x73');
  list.innerHTML = '';
  if (match.length === 0) {
    const div = document.createElement('div');
    div.className = 'x74';
    div.textContent = 'No matching systems found';
    list.appendChild(div);
  } else {
    match.forEach(s => x69(s)); // reuse addSystem logic
    x79(x68._active);
  }
};

export const x78 = function addSearchBox(label = "Search systems...") { // addSearchBox
  const sec = x68._nav.querySelector('.nav-section');
  if (!sec) return;

  const wrap = document.createElement('div');
  wrap.style.padding = '10px 0';
  const inp = document.createElement('input');
  inp.placeholder = label;
  inp.style.width = '100%';
  inp.oninput = e => x77(e.target.value);
  wrap.appendChild(inp);
  sec.insertBefore(wrap, sec.lastChild);
};

export const x79 = function updateUI(id) {                      // _updateActiveSystemUI
  document.querySelectorAll('.x75').forEach(b => b.classList.remove('active'));
  if (id) {
    const active = document.getElementById(`sys-${id}`);
    if (active) active.classList.add('active');
  }

  const btn = document.querySelector('.x71');
  if (btn) {
    const sys = x68._systems.find(s => s.id === id);
    btn.textContent = sys?.name || 'Select System';
  }
};
