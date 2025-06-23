/* ────────────────────────────────────────────────────────────────
   STAGE 8 — operator-extensions.js
   Purpose: Shared clipboard/export/context utilities
   Symbols: x130–x139
   ───────────────────────────────────────────────────────────── */

export const x130 = function copyToClipboard(text) {         // copyToClipboard
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('📋 Copied to clipboard');
    });
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
};

export const x131 = function downloadText(filename, text) {  // saveAsTextFile
  const blob = new Blob([text], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const x132 = function downloadPNG(canvas, name) {     // saveCanvasAsPNG
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = name || 'canvas.png';
  a.click();
};

export const x133 = function makeContextMenu(entries = []) { // createContextMenu
  const menu = document.createElement('ul');
  menu.className = 'x133';
  menu.style.cssText = `
    position:absolute; z-index:9999;
    background:white; border:1px solid #aaa;
    padding:4px; list-style:none; font-family:monospace;
  `;
  entries.forEach(({label, action}) => {
    const li = document.createElement('li');
    li.textContent = label;
    li.style.padding = '4px 10px';
    li.onmouseenter = () => li.style.background = '#eef';
    li.onmouseleave = () => li.style.background = '';
    li.onclick = () => { action(); remove(); };
    menu.appendChild(li);
  });

  function remove() {
    document.body.removeChild(menu);
    window.removeEventListener('click', remove);
  }

  menu.showAt = (x, y) => {
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    document.body.appendChild(menu);
    window.addEventListener('click', remove);
  };

  return menu;
};

export const x134 = function attachContextTo(el, opts = []) { // attachMenuToElement
  el.oncontextmenu = (ev) => {
    ev.preventDefault();
    const menu = x133(opts);
    menu.showAt(ev.clientX, ev.clientY);
  };
};

export const x135 = function promptBox(msg, callback) {       // confirmPrompt
  const ok = confirm(msg);
  if (ok) callback();
};

export const x136 = function delay(ms) {                      // wait(ms)
  return new Promise(r => setTimeout(r, ms));
};

export const x137 = function encodeID(str, charset) {         // encodeStrToID(str, charset)
  let id = 0n;
  const k = BigInt(charset.length);
  for (const ch of str) {
    const i = charset.indexOf(ch);
    if (i === -1) throw new Error(`Invalid char: ${ch}`);
    id = id * k + BigInt(i);
  }
  return id;
};

export const x138 = function decodeID(id, charset) {          // decodeIDToStr(id, charset)
  let result = '';
  const k = BigInt(charset.length);
  while (id > 0n) {
    const i = Number(id % k);
    result = charset[i] + result;
    id = id / k;
  }
  return result;
};

export const x139 = function injectExtensions(kernel) {       // injectClipboardOps
  kernel.x44(200, ({text}) => x130(text), 'Copy text');
  kernel.x44(201, ({text, file}) => x131(file || 'export.txt', text), 'Download text');
};
