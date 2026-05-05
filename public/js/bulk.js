/* ============================================================
   JS/BULK.JS — Bulk domain resolver
   ============================================================ */
//bulk.js
'use strict';

async function doBulk() {
  const raw  = document.getElementById('bulk-input').value.trim();
  const type = document.getElementById('bulk-type-select').value;
  if (!raw) return;

  const domains = raw.split('\n').map(d => d.trim()).filter(Boolean);
  if (!domains.length) return;

  const area = document.getElementById('bulk-area');
  area.innerHTML = `<div class="loading"><div class="spinner"></div>
    Resolving ${domains.length} domain(s)...</div>`;

  try {
    const res  = await fetch('/api/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domains, type })
    });
    const data = await res.json();

    const ok  = data.filter(d => d.status === 'ok').length;
    const err = data.filter(d => d.status === 'error').length;

    let html = `
      <div class="summary-grid" style="margin-bottom:16px">
        <div class="summary-card"><div class="summary-val">${data.length}</div><div class="summary-label">Total</div></div>
        <div class="summary-card"><div class="summary-val green">${ok}</div><div class="summary-label">Resolved</div></div>
        <div class="summary-card"><div class="summary-val red">${err}</div><div class="summary-label">Failed</div></div>
      </div>`;

    html += data.map(d => {
      if (d.status === 'ok') {
        const vals = (d.answer || []).map(a => a.value).join(', ') || '—';
        return `<div class="bulk-row">
          <span class="bulk-domain">${d.domain}</span>
          <span class="bulk-answer">${vals}</span>
          <span class="bulk-status ${d.fromCache ? 'cache' : 'ok'}">${d.fromCache ? 'CACHED' : 'RESOLVED'}</span>
          <span class="bulk-ms">${d.ms}ms</span>
        </div>`;
      } else {
        return `<div class="bulk-row">
          <span class="bulk-domain">${d.domain}</span>
          <span class="bulk-answer" style="color:var(--red)">${d.error}</span>
          <span class="bulk-status error">FAILED</span>
          <span class="bulk-ms">${d.ms}ms</span>
        </div>`;
      }
    }).join('');

    area.innerHTML = html;

  } catch (e) {
    area.innerHTML = `<div class="error-box">Bulk resolve failed: ${e.message}</div>`;
  }
}
