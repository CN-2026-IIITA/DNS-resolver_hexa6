/* ============================================================
   JS/COMPARE.JS — Iterative vs Recursive comparison
   ============================================================ */

'use strict';

async function doCompare() {
  const domain = document.getElementById('compare-input').value.trim();
  if (!domain) return;

  const area = document.getElementById('compare-area');
  area.innerHTML = `<div class="loading"><div class="spinner"></div>
    Running both resolution modes for ${domain}...</div>`;

  try {
    const res  = await fetch(`/api/compare?domain=${encodeURIComponent(domain)}`);
    const data = await res.json();

    const iter   = data.iterative;
    const recur  = data.recursive;
    const faster = iter.totalMs <= recur.totalMs ? 'iter' : 'recur';

    area.innerHTML = `
      <div class="compare-grid">
        <div class="compare-card">
          <h3 class="iter">Iterative Resolution</h3>
          <p>Your resolver contacts each server directly</p>
          <div class="compare-ms iter">${iter.totalMs}ms ${faster === 'iter' ? '⚡' : ''}</div>
          <div class="compare-hops">${iter.steps?.length || 0} hops · Root → TLD → Auth</div>
          <div id="iter-hops"></div>
        </div>
        <div class="compare-card">
          <h3 class="recur">Recursive Resolution</h3>
          <p>8.8.8.8 does all the work for you</p>
          <div class="compare-ms recur">${recur.totalMs}ms ${faster === 'recur' ? '⚡' : ''}</div>
          <div class="compare-hops">${recur.steps?.length || 0} hop · Single query to resolver</div>
          <div id="recur-hops"></div>
        </div>
      </div>
      <div class="compare-info">
        <strong style="color:var(--text)">Key difference:</strong> Iterative resolution shows every step —
        root, TLD, and authoritative server — giving full visibility but taking more round trips.
        Recursive resolution delegates all the work to a full-service resolver (like 8.8.8.8)
        which returns the final answer in a single response.
      </div>`;

    renderHopsInContainer(iter.steps  || [], 'iter-hops');
    renderHopsInContainer(recur.steps || [], 'recur-hops');

  } catch (e) {
    area.innerHTML = `<div class="error-box">Compare failed: ${e.message}</div>`;
  }
}

function renderHopsInContainer(steps, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  steps.forEach((step, i) => {
    setTimeout(() => {
      const hop    = document.createElement('div');
      hop.className = 'hop';
      const isLast = i === steps.length - 1;

      hop.innerHTML = `
        <div class="hop-line">
          <div class="hop-dot ${step.type}"></div>
          ${!isLast ? '<div class="hop-connector"></div>' : ''}
        </div>
        <div class="hop-body">
          <div class="hop-header">
            <span class="hop-name" style="font-size:12px">${step.server}</span>
            <span class="hop-ms">${step.ms}ms</span>
          </div>
          <div class="hop-msg" style="font-size:11px">${step.message}</div>
        </div>`;

      container.appendChild(hop);
      requestAnimationFrame(() => hop.classList.add('visible'));
    }, i * 300);
  });
}
