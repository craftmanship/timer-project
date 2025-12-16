(function () {
  // Lightweight tablet touch debugger to determine why buttons aren't responding.
  // Save as /tablet-debug-touch.js and include with: <script src="/tablet-debug-touch.js" defer></script>
  // What it does:
  // - Logs discovery info to window.debugLog or console
  // - Shows a small control UI to dump buttons, attach test listeners, and toggle overlay pointer passthrough
  // - Captures pointerdown (capture phase) and reports elementAtPoint so we can see what's receiving touches

  function log(...args) {
    const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    if (window.debugLog && typeof window.debugLog.log === 'function') {
      window.debugLog.log(msg);
    } else {
      console.log(msg);
    }
  }

  function short(t) {
    if (!t) return '';
    return String(t).trim().replace(/\s+/g, ' ').slice(0, 60);
  }

  function makeCtrl() {
    const wrapper = document.createElement('div');
    wrapper.id = '__tablet_debug_ctrl';
    wrapper.style.position = 'fixed';
    wrapper.style.left = '8px';
    wrapper.style.bottom = '8px';
    wrapper.style.zIndex = 2147483646; // just under debug overlay if it uses 2147483647
    wrapper.style.background = 'rgba(0,0,0,0.6)';
    wrapper.style.color = '#fff';
    wrapper.style.fontFamily = 'sans-serif';
    wrapper.style.fontSize = '12px';
    wrapper.style.padding = '6px';
    wrapper.style.borderRadius = '6px';
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '6px';
    wrapper.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)';

    const title = document.createElement('div');
    title.textContent = 'Touch Debug';
    title.style.fontWeight = '600';
    title.style.marginBottom = '4px';
    wrapper.appendChild(title);

    const btnDump = document.createElement('button');
    btnDump.textContent = 'Dump Buttons';
    btnDump.style.padding = '6px';
    btnDump.addEventListener('click', dumpButtons);
    wrapper.appendChild(btnDump);

    const btnAttach = document.createElement('button');
    btnAttach.textContent = 'Attach Test Listeners';
    btnAttach.style.padding = '6px';
    btnAttach.addEventListener('click', attachTestListeners);
    wrapper.appendChild(btnAttach);

    const btnToggleOverlay = document.createElement('button');
    btnToggleOverlay.textContent = 'Toggle Overlay Passthrough';
    btnToggleOverlay.style.padding = '6px';
    btnToggleOverlay.addEventListener('click', toggleOverlayPassthrough);
    wrapper.appendChild(btnToggleOverlay);

    const info = document.createElement('div');
    info.id = '__tablet_debug_info';
    info.style.opacity = '0.9';
    info.style.fontSize = '11px';
    info.textContent = 'Tap "Dump Buttons", then press your Start button. Watch logs in overlay.';
    wrapper.appendChild(info);

    document.body.appendChild(wrapper);
  }

  let overlayEl = null;
  let overlayPassthrough = false;

  function findOverlay() {
    overlayEl = document.getElementById('__debug_overlay_v1') ||
                document.getElementById('debug-log-overlay') ||
                document.querySelector('[id^="__debug_overlay"], #debug-log-overlay, [id*="debug"][style*="z-index"]');
    if (overlayEl) {
      log('Found overlay element: id="' + overlayEl.id + '"');
    } else {
      log('No debug overlay element found by known ids');
    }
    return overlayEl;
  }

  function dumpButtons() {
    const candidates = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], [role="button"], a.button, .btn'));
    // Filter out control UI we injected
    const filtered = candidates.filter(el => {
      if (!el.offsetParent && el !== document.activeElement) return true; // still show hidden ones
      // avoid our control element and overlay buttons
      if (el.closest && el.closest('#__tablet_debug_ctrl')) return false;
      if (el.closest && (el.closest('#__debug_overlay_v1') || el.closest('#debug-log-overlay'))) return false;
      return true;
    });
    log('Buttons found: ' + filtered.length);
    filtered.forEach((b, i) => {
      try {
        log(`${i}: tag=${b.tagName} id="${b.id}" class="${short(b.className)}" text="${short(b.innerText||b.value)}" disabled=${b.disabled}`);
      } catch (e) {
        log('Error reading button info: ' + e);
      }
    });
    if (filtered.length === 0) log('No candidate buttons found on page.');
  }

  function attachTestListeners() {
    const all = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], [role="button"], a.button, .btn'));
    const filtered = all.filter(el => !(el.closest && el.closest('#__tablet_debug_ctrl')) && !(el.closest && (el.closest('#__debug_overlay_v1') || el.closest('#debug-log-overlay'))));
    if (filtered.length === 0) {
      log('No buttons to attach to.');
      return;
    }
    filtered.forEach((b, idx) => {
      // Avoid attaching duplicate listeners
      if (b.__tablet_debug_attached) return;
      b.__tablet_debug_attached = true;
      b.addEventListener('click', function (ev) {
        log('Test listener: click on element id="' + (b.id || '') + '" text="' + short(b.innerText || b.value) + '"');
        // quick visual feedback
        const prev = b.style.boxShadow;
        b.style.boxShadow = '0 0 0 3px rgba(0,255,0,0.6)';
        setTimeout(() => { b.style.boxShadow = prev; }, 350);
      }, { passive: true });
      // pointerdown capture to detect touch specifically
      b.addEventListener('pointerdown', function (ev) {
        log('Test listener: pointerdown on ' + (b.id || short(b.innerText)));
      }, { passive: true });
    });
    log('Attached test listeners to ' + filtered.length + ' elements.');
    log('Now tap your Start button; overlay should show "click" or "pointerdown" logs.');
  }

  function toggleOverlayPassthrough() {
    if (!overlayEl) findOverlay();
    if (!overlayEl) {
      log('No overlay found to toggle. If your overlay has a different id, tell me its id.');
      return;
    }
    overlayPassthrough = !overlayPassthrough;
    overlayEl.style.pointerEvents = overlayPassthrough ? 'none' : '';
    overlayEl.style.opacity = overlayPassthrough ? '0.6' : '';
    log('Overlay pointer passthrough ' + (overlayPassthrough ? 'ENABLED (overlay ignores touches)' : 'DISABLED (overlay receives touches)'));
  }

  // Global pointerdown capture to show which element receives events at the coordinates
  function attachPointerProbe() {
    document.addEventListener('pointerdown', function (ev) {
      try {
        const x = ev.clientX, y = ev.clientY;
        const topEl = document.elementFromPoint(x, y);
        const desc = topEl ? (topEl.tagName + (topEl.id ? ' #' + topEl.id : '') + ' text="' + short(topEl.innerText || topEl.value) + '"') : 'no element';
        log(`Pointerdown at (${x},${y}) -> top element: ${desc}`);
      } catch (e) {
        log('pointer probe error: ' + e);
      }
    }, true); // capture
  }

  // Initialization
  function init() {
    try {
      log('tablet-debug-touch initializing...');
      findOverlay();
      if (!document.body) {
        document.addEventListener('DOMContentLoaded', function () { makeCtrl(); attachPointerProbe(); log('DOM ready - control injected'); });
      } else {
        makeCtrl();
        attachPointerProbe();
        log('Control injected');
      }
      // safety: if overlay covers entire screen and blocks touches, user can toggle passthrough
      log('Use "Toggle Overlay Passthrough" to let touches through the debug overlay.');
    } catch (err) {
      log('tablet-debug-touch init error: ' + (err && err.message ? err.message : err));
    }
  }

  // Run init asap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0);
  }

  // Expose small API for manual use from other scripts if needed
  window.__tablet_debug = {
    dumpButtons,
    attachTestListeners,
    toggleOverlayPassthrough,
    findOverlay
  };
})();