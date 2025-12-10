(function () {
  const SEGMENT = 'client/subscribe';
  const OLD_PREFIX = '/api/v1';
  
  // Insert real api host
  const NEW_PREFIX = '';

  console.log('[RandoPatch] custom.js loaded, starting patch…');

  function transformUrl(url) {
    if (!url || typeof url !== 'string') return url;
    if (!url.includes(SEGMENT)) return url;

    const oldFull = OLD_PREFIX + '/' + SEGMENT;
    const newFull = NEW_PREFIX + '/' + SEGMENT;

    if (url.includes(oldFull)) {
      const replaced = url.replaceAll(oldFull, newFull);
      console.log('[RandoPatch] URL replaced:', url, '=>', replaced);
      return replaced;
    }

    if (url.includes('/' + SEGMENT)) {
      const replaced = url.replace(/\/[^\/]*client\/subscribe/, newFull);
      console.log('[RandoPatch] URL generic replaced:', url, '=>', replaced);
      return replaced;
    }

    return url;
  }

  function patchOneElement(el) {
    if (!el || !el.getAttribute) return;

    ['href', 'value', 'data-clipboard-text'].forEach(attr => {
      const v = el.getAttribute(attr);
      if (v && v.includes(SEGMENT)) {
        const nv = transformUrl(v);
        if (nv !== v) {
          el.setAttribute(attr, nv);
          console.log('[RandoPatch] patched', attr, 'on', el.tagName, '=>', nv);
        }
      }
    });

    if (el.innerText && el.innerText.includes(SEGMENT)) {
      const oldText = el.innerText;
      const newText = transformUrl(oldText);
      if (newText !== oldText) {
        el.innerText = newText;
        console.log('[RandoPatch] patched innerText on', el.tagName, '=>', newText);
      }
    }
  }

  function patchAll() {
    document.querySelectorAll('*').forEach(patchOneElement);
  }

  document.addEventListener('DOMContentLoaded', function () {
    console.log('[RandoPatch] DOMContentLoaded');
    patchAll();
  });

  const observer = new MutationObserver(muts => {
    muts.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          patchOneElement(node);
          node.querySelectorAll &&
            node.querySelectorAll('*').forEach(patchOneElement);
        }
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  setInterval(patchAll, 3000);

  if (navigator.clipboard && navigator.clipboard.writeText) {
    const origWriteText = navigator.clipboard.writeText.bind(navigator.clipboard);
    navigator.clipboard.writeText = function (text) {
      let newText = text;
      if (typeof text === 'string' && text.includes(SEGMENT)) {
        newText = transformUrl(text);
        console.log('[RandoPatch] clipboard.writeText patched:', text, '=>', newText);
      }
      return origWriteText(newText);
    };
    console.log('[RandoPatch] navigator.clipboard.writeText hooked');
  } else {
    console.log('[RandoPatch] navigator.clipboard.writeText not available, skip hook');
  }

  if (document.execCommand) {
    const origExecCommand = document.execCommand.bind(document);
    document.execCommand = function (command, showUI, valueArg) {
      if (typeof command === 'string' && command.toLowerCase() === 'copy') {
        try {
          const active = document.activeElement;
          if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
            const v = active.value;
            if (v && v.includes(SEGMENT)) {
              const nv = transformUrl(v);
              if (nv !== v) {
                active.value = nv;
                active.setSelectionRange(0, nv.length);
                console.log('[RandoPatch] execCommand(copy) patched INPUT/TEXTAREA value:', v, '=>', nv);
              }
            }
          } else {
            const sel = window.getSelection && window.getSelection();
            if (sel && sel.toString && sel.toString().includes(SEGMENT)) {
              const text = sel.toString();
              const nv = transformUrl(text);
              if (nv !== text) {
                const range = sel.getRangeAt(0);
                const tmp = document.createElement('span');
                tmp.textContent = nv;
                range.deleteContents();
                range.insertNode(tmp);
                sel.removeAllRanges();
                const newRange = document.createRange();
                newRange.selectNodeContents(tmp);
                sel.addRange(newRange);
                console.log('[RandoPatch] execCommand(copy) patched selection:', text, '=>', nv);
              }
            }
          }
        } catch (e) {
          console.warn('[RandoPatch] execCommand patch error:', e);
        }
      }
      return origExecCommand(command, showUI, valueArg);
    };
    console.log('[RandoPatch] document.execCommand hooked');
  }
})();
