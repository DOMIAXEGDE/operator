/* ────────────────────────────────────────────────────────────────
   STAGE 7 — operator-build.js
   Purpose: Logic/Memory terminal via sandboxed iframe
   Symbols: x120–x139
   ───────────────────────────────────────────────────────────── */

export class x120 {                                     // BuildRenderer
  /** @param {x23} cell */
  constructor(cell) {
    this.x121 = cell;                                   // cell
    this.x122 = document.createElement('div');          // wrapper
    this.x123 = null;                                   // iframe
    this.x124 = {};                                     // parent API
  }

  x125() {                                              // mount()
    this.x121.x32.innerHTML = '';
    this.x122.className = 'x122';
    this.x123 = document.createElement('iframe');
    this.x123.style.width = '100%';
    this.x123.style.height = '100%';
    this.x123.style.border = 'none';
    this.x123.loading = 'eager';

    this.x123.srcdoc = this.x126();                     // inject HTML
    this.x122.appendChild(this.x123);
    this.x121.x32.appendChild(this.x122);

    this.x127();                                        // wire postMessage API
  }

  x126() {                                              // getIframeHTML()
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { margin:0; font-family:monospace; background:#1e1e1e; color:#eee; }
    #term { padding:10px; height:100vh; overflow:auto; }
    input { width:100%; background:#000; color:#0f0; border:none; padding:6px; font-family:inherit; }
  </style>
</head>
<body>
  <div id="term">Build System Ready.<br></div>
  <input id="x128" placeholder="Enter command..." autofocus />
  <script>
    const log = msg => {
      const t = document.getElementById('term');
      t.innerHTML += msg + '<br>';
      t.scrollTop = t.scrollHeight;
    };

    const input = document.getElementById('x128');
    input.onkeydown = e => {
      if (e.key === 'Enter') {
        const cmd = input.value;
        log('> ' + cmd);
        input.value = '';
        parent.postMessage({type:'cmd', payload:cmd}, '*');
      }
    };

    window.addEventListener('message', e => {
      if (e.data?.type === 'result') {
        log('↳ ' + e.data.payload);
      }
    });
  </script>
</body>
</html>`;
  }

  x127() {                                              // bindMessaging()
    this.x124.eval = cmd => {
      const win = this.x123.contentWindow;
      if (!win) return;
      // Echo a result into iframe
      setTimeout(() => {
        win.postMessage({type:'result', payload:`[eval'd] ${cmd}`}, '*');
      }, 200);
    };

    window.addEventListener('message', ev => {
      if (ev.source !== this.x123.contentWindow) return;
      const msg = ev.data;
      if (msg.type === 'cmd') {
        this.x121.x33?.x124?.eval(msg.payload); // loopback eval
      }
    });
  }

  x129() {}                                             // unmount()
}
