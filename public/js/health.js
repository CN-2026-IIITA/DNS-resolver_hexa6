/* ============================================================
   JS/HEALTH.JS — DNS health audit
   ============================================================ */

'use strict';
//health.js
async function doHealth() {
  const domain = document.getElementById('health-input').value.trim();
  if (!domain) return;

  const area = document.getElementById('health-area');
  area.innerHTML = `<div class="loading"><div class="spinner"></div>
    Running DNS health audit for ${domain}...</div>`;

  try {
    const res  = await fetch(`/api/health?domain=${encodeURIComponent(domain)}`);
    const data = await res.json();

    if (data.error) { area.innerHTML = `<div class="error-box">${data.error}</div>`; return; }

    const scoreClass = data.score >= 85 ? 'excellent' : data.score >= 60 ? 'good' : data.score >= 40 ? 'poor' : 'bad';
    const scoreLabel = data.score >= 85 ? 'Excellent' : data.score >= 60 ? 'Good' : data.score >= 40 ? 'Needs Work' : 'Critical';
    const barColor   = data.score >= 85 ? 'var(--green)' : data.score >= 60 ? 'var(--accent)' : data.score >= 40 ? 'var(--amber)' : 'var(--red)';

    let html = `
      <div class="tree-container" style="text-align:center; margin-bottom:20px">
        <div class="health-score ${scoreClass}">${data.score}</div>
        <div class="health-label">${scoreLabel} · ${data.passed} passed · ${data.failed} failed · ${data.warned} warnings</div>
        <div class="health-bar-wrap">
          <div class="health-bar" style="width:${data.score}%; background:${barColor}"></div>
        </div>
      </div>
      <div class="check-list">`;

    html += data.checks.map(c => {
      const icon = c.status === 'pass' ? '✓' : c.status === 'fail' ? '✗' : '⚠';
      return `<div class="check-item ${c.status}">
        <div class="check-icon">${icon}</div>
        <div>
          <div class="check-name">${c.name}</div>
          <div class="check-detail">${c.detail}</div>
          ${c.recommendation ? `<div class="check-rec">${c.recommendation}</div>` : ''}
        </div>
      </div>`;
    }).join('');

    html += '</div>';
    area.innerHTML = html;

  } catch (e) {
    area.innerHTML = `<div class="error-box">Health check failed: ${e.message}</div>`;
  }
}
