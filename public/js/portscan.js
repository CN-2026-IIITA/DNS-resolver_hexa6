/* ============================================================
   JS/PORTSCAN.JS — Port scanner
   ============================================================ */

'use strict';

async function doPortScan() {
  const domain = document.getElementById('port-input').value.trim();
  if (!domain) return;

  const area = document.getElementById('port-area');
  area.innerHTML = `<div class="loading"><div class="spinner"></div>
    Scanning ports on ${domain} — this may take a moment...</div>`;

  try {
    const res  = await fetch(`/api/portscan?domain=${encodeURIComponent(domain)}`);
    const data = await res.json();

    if (data.error) { area.innerHTML = `<div class="error-box">${data.error}</div>`; return; }

    const openPorts = data.results.filter(p => p.open).length;

    let html = `
      <div class="summary-grid" style="margin-bottom:16px">
        <div class="summary-card"><div class="summary-val accent">${data.ip}</div><div class="summary-label">Resolved IP</div></div>
        <div class="summary-card"><div class="summary-val green">${openPorts}</div><div class="summary-label">Open Ports</div></div>
        <div class="summary-card"><div class="summary-val">${data.results.length - openPorts}</div><div class="summary-label">Closed</div></div>
      </div>
      <div class="port-grid">`;

    html += data.results.map(p => `
      <div class="port-card ${p.open ? 'open' : 'closed'}">
        <div class="port-num ${p.open ? 'open' : 'closed'}">
          <span class="port-dot ${p.open ? 'open' : 'closed'}"></span>${p.port}
        </div>
        <div class="port-name">${p.name}</div>
        <div class="port-desc">${p.desc}</div>
        <div class="port-ms">${p.ms}ms</div>
      </div>`).join('');

    html += '</div>';
    area.innerHTML = html;

  } catch (e) {
    area.innerHTML = `<div class="error-box">Port scan failed: ${e.message}</div>`;
  }
}
