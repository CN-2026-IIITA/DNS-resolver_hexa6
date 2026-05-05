'use strict';

// health.js
async function doHealth() {
  const inputEl = document.getElementById('health-input');
  const area = document.getElementById('health-area');

  const domain = inputEl.value.trim();
  if (!domain) {
    area.innerHTML = `<div class="error-box">Please enter a domain</div>`;
    return;
  }

  // 🔄 Loading UI
  area.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <div>Running DNS health audit for <b>${domain}</b>...</div>
    </div>
  `;

  try {
    const res = await fetch(`/api/health?domain=${encodeURIComponent(domain)}`);
    const data = await res.json();

    if (!res.ok || data.error) {
      area.innerHTML = `<div class="error-box">${data.error || 'Something went wrong'}</div>`;
      return;
    }

    // 🎯 Score logic
    const score = data.score ?? 0;

    const scoreClass =
      score >= 85 ? 'excellent' :
      score >= 60 ? 'good' :
      score >= 40 ? 'poor' : 'bad';

    const scoreLabel =
      score >= 85 ? 'Excellent' :
      score >= 60 ? 'Good' :
      score >= 40 ? 'Needs Work' : 'Critical';

    const barColor =
      score >= 85 ? 'var(--green)' :
      score >= 60 ? 'var(--accent)' :
      score >= 40 ? 'var(--amber)' : 'var(--red)';

    // 🧩 Score block
    let html = `
      <div class="tree-container" style="text-align:center; margin-bottom:20px">
        <div class="health-score ${scoreClass}">${score}</div>
        <div class="health-label">
          ${scoreLabel} · ${data.passed ?? 0} passed · ${data.failed ?? 0} failed · ${data.warned ?? 0} warnings
        </div>
        <div class="health-bar-wrap">
          <div class="health-bar" 
               style="width:${score}%; background:${barColor}; transition: width 0.6s ease;">
          </div>
        </div>
      </div>

      <div class="check-list">
    `;

    // 🧪 Checks rendering
    html += (data.checks || []).map(c => {
      const status = c.status || 'warn';

      const icon =
        status === 'pass' ? '✓' :
        status === 'fail' ? '✗' : '⚠';

      return `
        <div class="check-item ${status}">
          <div class="check-icon">${icon}</div>
          <div>
            <div class="check-name">${c.name || 'Unknown Check'}</div>
            <div class="check-detail">${c.detail || ''}</div>
            ${c.recommendation ? `<div class="check-rec">${c.recommendation}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    html += `</div>`;

    // 🎯 Final render
    area.innerHTML = html;

  } catch (e) {
    area.innerHTML = `
      <div class="error-box">
        Health check failed: ${e.message}
      </div>
    `;
  }
}
