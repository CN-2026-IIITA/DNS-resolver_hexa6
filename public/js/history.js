/* ============================================================
   JS/HISTORY.JS — Query history log
   ============================================================ */

'use strict';
//history.js
const queryHistory = [];

function addToHistory(entry) {
  queryHistory.unshift(entry);
  if (queryHistory.length > 20) queryHistory.pop();
}

function renderHistory() {
  const area = document.getElementById('history-area');
  if (!area) return;

  if (!queryHistory.length) {
    area.innerHTML = `<div class="empty"><div class="empty-icon">◷</div>
      <p>No queries yet. Resolve some domains to see history.</p></div>`;
    return;
  }

  area.innerHTML = queryHistory.map((h, i) => `
    <div class="history-item" onclick="rerunQuery(${i})">
      <span class="type-badge type-${h.type}">${h.type}</span>
      <span class="history-domain">${h.domain}</span>
      <span class="history-cache ${h.fromCache ? 'hit' : 'miss'}">${h.fromCache ? 'CACHE HIT' : 'RESOLVED'}</span>
      <span class="history-time">${formatTime(h.time)}</span>
    </div>`).join('');
}

function rerunQuery(idx) {
  const h = queryHistory?.[idx];
  if (!h) return; // safety check

  // Switch to resolve tab
  const resolveTab = document.querySelector('.tab');
  if (resolveTab) {
    switchTab('resolve', resolveTab);
  }

  setTimeout(() => {
    const domainEl = document.getElementById('domain-input');
    const typeEl   = document.getElementById('type-select');

    if (domainEl && h.domain !== undefined) {
      domainEl.value = h.domain;
    }

    if (typeEl && h.type !== undefined) {
      typeEl.value = h.type;
    }

    // Re-run query
    doResolve();
  }, 100);
}

function clearHistory() {
  queryHistory.length = 0;
  renderHistory();
}

function formatTime(d) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
