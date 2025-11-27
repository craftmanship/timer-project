(function () {
  // 이미 있으면 재정의하지 않음
  if (window.debugLog) return;

  const container = document.createElement('div');
  container.id = 'debug-log-overlay';
  const css = `
    #debug-log-overlay {
      position: fixed;
      right: 8px;
      bottom: 8px;
      width: 320px;
      max-height: 40vh;
      overflow: auto;
      background: rgba(20,20,20,0.9);
      color: #e6e6e6;
      font-family: monospace;
      font-size: 12px;
      padding: 8px;
      border-radius: 6px;
      z-index: 999999;
      box-shadow: 0 2px 10px rgba(0,0,0,0.6);
    }
    #debug-log-overlay .dbg-line { margin-bottom:4px; white-space:pre-wrap; word-break:break-word; }
    #debug-log-overlay .dbg-error { color:#ffaaaa; }
    #debug-log-overlay .dbg-time { color:#99ccff; margin-right:6px; }
    #debug-log-controls { display:flex; gap:6px; margin-bottom:6px; }
    #debug-log-controls button { flex:1; font-size:11px; padding:4px; }
  `;
  const style = document.createElement('style');
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  const controls = document.createElement('div');
  controls.id = 'debug-log-controls';
  controls.innerHTML = '<button id="dbg-clear">Clear</button><button id="dbg-hide">Hide</button>';
  container.appendChild(controls);

  const content = document.createElement('div');
  content.id = 'debug-log-content';
  container.appendChild(content);

  document.body.appendChild(container);

  function timeStamp() {
    const d = new Date();
    return d.toLocaleTimeString();
  }

  function appendLine(msg, cls) {
    const el = document.createElement('div');
    el.className = 'dbg-line' + (cls ? ' ' + cls : '');
    el.innerHTML = `<span class="dbg-time">${timeStamp()}</span>${String(msg)}`;
    content.appendChild(el);
    // 자동 스크롤
    content.scrollTop = content.scrollHeight;
  }

  document.getElementById('dbg-clear').addEventListener('click', () => {
    content.innerHTML = '';
  });
  document.getElementById('dbg-hide').addEventListener('click', (e) => {
    container.style.display = 'none';
  });

  // 기존 console 유지하면서 오버레이에도 표시
  const origConsole = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console)
  };

  console.log = function (...args) {
    origConsole.log(...args);
    appendLine(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' '));
  };
  console.info = function (...args) {
    origConsole.info(...args);
    appendLine(args.join(' '));
  };
  console.warn = function (...args) {
    origConsole.warn(...args);
    appendLine(args.join(' '), 'dbg-error');
  };
  console.error = function (...args) {
    origConsole.error(...args);
    appendLine(args.join(' '), 'dbg-error');
  };

  // 전역 에러/Promise 거부 캡처
  window.addEventListener('error', function (ev) {
    appendLine((ev && ev.message) ? `${ev.message} (${ev.filename}:${ev.lineno})` : String(ev), 'dbg-error');
  });
  window.addEventListener('unhandledrejection', function (ev) {
    appendLine('UnhandledRejection: ' + (ev.reason ? (ev.reason.stack || ev.reason) : ev), 'dbg-error');
  });

  // public API
  window.debugLog = {
    log: appendLine,
    error: (msg) => appendLine(msg, 'dbg-error'),
    clear: () => { content.innerHTML = ''; },
    show: () => { container.style.display = ''; },
    hide: () => { container.style.display = 'none'; }
  };

  // 초기 표시
  window.debugLog.log('debug overlay ready');
})();