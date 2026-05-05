/* ============================================================
   JS/PROPAGATION.JS — DNS propagation checker
   ============================================================ */

'use strict';
//propoagtion.js
async function doPropagation() {
  const domain = document.getElementById('prop-input').value.trim();
  if (!domain) return;

  const area = document.getElementById('propagation-area');
  area.innerHTML = `<div class="loading"><div class="spinner"></div>
    Checking propagation for ${domain} across 6 DNS servers...</div>`;

  try {
    const res  = await fetch(`/api/propagation?domain=${encodeURIComponent(domain)}`);
    const data = await res.json();

    const banner = data.propagated
      ? `<div class="prop-banner propagated">✓ Fully Propagated — all ${data.resolvedCount} servers return consistent results</div>`
      : `<div class="prop-banner partial">⚠ Partial / Inconsistent — ${data.resolvedCount}/${data.total} servers resolved, results may differ</div>`;

    const cards = data.results.map(r => `
      <div class="prop-card ${r.status}">
        <div class="prop-card-top">
          <span class="prop-server">${r.server}</span>
          <span class="prop-badge ${r.status === 'resolved' ? 'ok' : 'fail'}">${r.status === 'resolved' ? 'OK' : 'FAIL'}</span>
        </div>
        <div class="prop-ip">${r.ip} · ${r.location}</div>
        ${r.status === 'resolved'
          ? `<div class="prop-answers">${r.answers.join('<br>')}</div>`
          : `<div style="font-size:11px; color:var(--red)">${r.error}</div>`}
        <div class="prop-ms">${r.ms}ms</div>
      </div>`).join('');

    area.innerHTML = banner + `<div class="prop-grid">${cards}</div>`;

  } catch (e) {
    area.innerHTML = `<div class="error-box">Propagation check failed: ${e.message}</div>`;
  }
}
