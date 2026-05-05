/* ============================================================
   JS/CACHE.JS — Local DNS cache viewer
   ============================================================ */

'use strict';

async function loadCache() {
  const area = document.getElementById('cache-area');
  if (!area) return;

  try {
    const res  = await fetch('/api/cache');
    const data = await res.json();
    updateCacheCount(data.length);

    if (!data.length) {
      area.innerHTML = `<div class="empty"><div class="empty-icon">◎</div>
        <p>No cached entries yet.<br>Resolve some domains first.</p></div>`;
      return;
    }

    const rows = data.map(e => {
      const pct      = Math.round((e.ttlRemaining / e.ttl) * 100);
      const barClass = pct > 50 ? '' : pct > 20 ? 'low' : 'critical';
      const values   = e.data?.map(d => d.value).join(', ') || '—';
      return `<tr>
        <td style="color:var(--text); font-weight:500">${e.domain}</td>
        <td><span class="type-badge type-${e.type}">${e.type}</span></td>
        <td style="color:var(--green); max-width:200px; overflow:hidden; text-overflow:ellipsis">${values}</td>
        <td>
          <div style="display:flex; align-items:center; gap:8px">
            <div class="ttl-bar-wrap">
              <div class="ttl-bar ${barClass}" style="width:${pct}%"></div>
            </div>
            <span style="font-size:11px; color:var(--text3); white-space:nowrap">${e.ttlRemaining}s</span>
          </div>
        </td>
      </tr>`;
    }).join('');

    area.innerHTML = `
      <div style="background:var(--bg2); border:1px solid var(--border2); border-radius:12px; overflow:hidden">
        <table class="cache-table">
          <thead><tr>
            <th>Domain</th><th>Type</th><th>Value</th><th>TTL Remaining</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;

  } catch (e) {
    area.innerHTML = `<div class="error-box">Failed to load cache — is the server running?</div>`;
  }
}

async function clearCache() {
  await fetch('/api/cache', { method: 'DELETE' });
  updateCacheCount(0);
  loadCache();
}
