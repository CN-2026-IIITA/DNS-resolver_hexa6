'use strict';

const loadedFeatures = new Set();

async function loadFeature(name) {
  if (loadedFeatures.has(name)) return;
  loadedFeatures.add(name);
  try {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/css/features/${name}.css`;
    link.onerror = () => console.warn(`[loadFeature] CSS not found: /css/features/${name}.css`);
    document.head.appendChild(link);
    const res = await fetch(`/features/${name}.html`);
    if (!res.ok) throw new Error(`HTTP ${res.status} — /features/${name}.html`);
    const html = await res.text();
    const container = document.getElementById('tab-container');
    if (!container) throw new Error('Missing #tab-container in DOM');
    container.insertAdjacentHTML('beforeend', html);
  } catch (err) {
    console.error(`[loadFeature] Failed to load "${name}":`, err);
    loadedFeatures.delete(name);
  }
}

async function switchTab(id, btn) {
  try {
    await loadFeature(id);
  } catch (err) {
    console.error(`[switchTab] Could not load feature "${id}":`, err);
    return;
  }
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const panel = document.getElementById('tab-' + id);
  if (!panel) {
    console.warn(`[switchTab] No panel found for tab: #tab-${id}`);
    return;
  }
  panel.classList.add('active');
  btn.classList.add('active');
  if (id === 'cache')   loadCache();
  if (id === 'history') renderHistory();
}

function updateCacheCount(n) {
  const el = document.getElementById('cache-count');
  if (!el) return;
  if (n !== undefined) {
    el.textContent = `${n} cached`;
    return;
  }
  fetch('/api/cache')
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(data => {
      if (!Array.isArray(data)) throw new Error('Unexpected response shape');
      el.textContent = `${data.length} cached`;
    })
    .catch(err => console.warn('[updateCacheCount] Failed to fetch cache:', err));
}

setInterval(updateCacheCount, 5000);

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadFeature('resolve');
    document.getElementById('tab-resolve')?.classList.add('active');
  } catch (err) {
    console.error('[DOMContentLoaded] Failed to load default tab "resolve":', err);
  }
  updateCacheCount();
});
