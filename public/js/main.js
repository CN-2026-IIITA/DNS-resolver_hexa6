/* ============================================================
   JS/MAIN.JS — Tab switching, feature loader, cache count
   ============================================================ */

'use strict';

/* ── Feature Loader ──────────────────────────────────────────
   Dynamically injects HTML partials into #tab-container and
   CSS into <head> the first time each tab is activated.
   ──────────────────────────────────────────────────────────── */

const loadedFeatures = new Set();

async function loadFeature(name) {
  if (loadedFeatures.has(name)) return;
  loadedFeatures.add(name);

  // Load CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `/css/features/${name}.css`;
  document.head.appendChild(link);

  // Load HTML partial
  const res = await fetch(`/features/${name}.html`);
  const html = await res.text();
  document.getElementById('tab-container').insertAdjacentHTML('beforeend', html);
}

/* ── Tab Switching ───────────────────────────────────────────  */

async function switchTab(id, btn) {
  // Load the feature if not yet loaded
  await loadFeature(id);

  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

  const panel = document.getElementById('tab-' + id);
  if (panel) panel.classList.add('active');
  btn.classList.add('active');

  // Trigger side-effects
  if (id === 'cache')   loadCache();
  if (id === 'history') renderHistory();
}

/* ── Cache Count ─────────────────────────────────────────────  */

function updateCacheCount(n) {
  const el = document.getElementById('cache-count');
  if (!el) return;
  if (n !== undefined) { el.textContent = `${n} cached`; return; }
  fetch('/api/cache')
    .then(r => r.json())
    .then(data => { el.textContent = `${data.length} cached`; })
    .catch(() => {});
}

setInterval(updateCacheCount, 5000);

/* ── Bootstrap ───────────────────────────────────────────────  */

document.addEventListener('DOMContentLoaded', async () => {
  // Always pre-load the default tab (resolve)
  await loadFeature('resolve');
  document.getElementById('tab-resolve')?.classList.add('active');
  updateCacheCount();
});
