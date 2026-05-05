/* ============================================================
   JS/RESOLVE.JS — DNS resolution + hop tree rendering
   ============================================================ */

'use strict';

async function doResolve() {
  const domain = document.getElementById('domain-input').value.trim();
  const type   = document.getElementById('type-select').value;
  if (!domain) return;

  const area = document.getElementById('result-area');
  area.innerHTML = `<div class="loading"><div class="spinner"></div>Resolving ${domain} (${type})...</div>`;

  try {
    const res  = await fetch(`/api/resolve?domain=${encodeURIComponent(domain)}&type=${type}`);
    const data = await res.json();

    if (!res.ok) {
      area.innerHTML = `<div class="error-box">✗ Resolution failed: ${data.error}</div>`;
      if (data.steps) renderSteps(data.steps, area);
      return;
    }

    // Push to history (shared state in history.js)
    if (typeof addToHistory === 'function') {
      addToHistory({ domain: data.domain, type: data.queryType, fromCache: data.fromCache, time: new Date(), result: data });
    }

    updateCacheCount();
    renderResult(data, area);

  } catch (e) {
    area.innerHTML = `<div class="error-box">✗ Network error: ${e.message}<br>
      <small style="opacity:0.7">Make sure the server is running on port 3000.</small></div>`;
  }
}

function renderResult(data, container) {
  const hops    = data.steps.length;
  const records = data.answer?.length || 0;

  container.innerHTML = `
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-val ${data.fromCache ? 'green' : 'accent'}">${data.fromCache ? 'HIT' : 'MISS'}</div>
        <div class="summary-label">Cache Status</div>
      </div>
      <div class="summary-card">
        <div class="summary-val accent">${data.totalMs}ms</div>
        <div class="summary-label">Total Time</div>
      </div>
      <div class="summary-card">
        <div class="summary-val">${hops}</div>
        <div class="summary-label">Hops</div>
      </div>
      <div class="summary-card">
        <div class="summary-val amber">${records}</div>
        <div class="summary-label">Records Found</div>
      </div>
    </div>
    <div class="tree-container">
      <div class="tree-title">
        Resolution Path — ${data.domain}
        <span class="tree-meta">
          <span class="type-badge type-${data.queryType}">${data.queryType}</span>
          ${data.fromCache ? ' · from cache' : ' · live query'}
        </span>
      </div>
      <div id="tree-hops"></div>
    </div>`;

  renderStepsAnimated(data.steps, 'tree-hops');
}

function renderStepsAnimated(steps, containerId = 'tree-hops') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  steps.forEach((step, i) => {
    setTimeout(() => {
      const hop    = document.createElement('div');
      hop.className = 'hop';
      const isLast = i === steps.length - 1;

      const results = step.result ? step.result.map(r => `
        <div class="record-row">
          <span class="record-value">${r.value}</span>
          ${r.ttl ? `<span class="record-ttl">TTL: ${r.ttl}s</span>` : ''}
        </div>`).join('') : '';

      hop.innerHTML = `
        <div class="hop-line">
          <div class="hop-dot ${step.type}"></div>
          ${!isLast ? '<div class="hop-connector"></div>' : ''}
        </div>
        <div class="hop-body">
          <div class="hop-header">
            <span class="hop-name">${step.server}</span>
            <span class="hop-ip">${step.serverIP}</span>
            ${step.ms !== undefined ? `<span class="hop-ms">${step.ms}ms</span>` : ''}
          </div>
          <div class="hop-msg">${step.message}</div>
          ${results ? `<div class="hop-result">${results}</div>` : ''}
        </div>`;

      container.appendChild(hop);
      requestAnimationFrame(() => hop.classList.add('visible'));
    }, i * 350);
  });
}

function renderSteps(steps, area) {
  const div = document.createElement('div');
  div.className = 'tree-container';
  div.style.marginTop = '12px';
  div.innerHTML = `<div class="tree-title">Steps attempted</div><div id="tree-hops"></div>`;
  area.appendChild(div);
  renderStepsAnimated(steps, 'tree-hops');
}
