/* ============================================================
   JS/DNSHISTORY.JS — DNS Record History & Trend Analysis
   ============================================================ */
'use strict';
//dnshistory.js
/* ── Timestamp normaliser ────────────────────────────────────
   Server may return timestamps as ms (number) or ISO string.
   Always normalise to milliseconds for Date arithmetic.
   ─────────────────────────────────────────────────────────── */
function toMs(ts) {
  if (!ts) return Date.now();
  if (typeof ts === 'number') {
    // If it looks like seconds (< year 3000 in seconds ≈ 32503680000)
    return ts < 1e12 ? ts * 1000 : ts;
  }
  const parsed = Date.parse(ts);
  return isNaN(parsed) ? Date.now() : parsed;
}

async function snapshotDNS() {
  const domain = document.getElementById('hist-domain').value.trim();
  const type = document.getElementById('hist-type').value;
  if (!domain) return;

  const out = document.getElementById('hist-result');
  out.innerHTML = `<div class="loading"><div class="spinner"></div><span>Resolving and saving snapshot…</span></div>`;

  try {
    const res = await fetch(`/api/history/record?domain=${encodeURIComponent(domain)}&type=${type}`);
    const data = await res.json();
    if (data.error) { out.innerHTML = `<div class="error-box">⚠ ${data.error}</div>`; return; }

    // Show success banner above history
    const banner = `
      <div style="background:rgba(0,255,157,0.08);border:1px solid var(--green);border-radius:10px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;gap:12px">
        <span style="font-size:18px">✅</span>
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--green)">Snapshot saved</div>
          <div style="font-size:11px;color:var(--text2);margin-top:2px">
            ${data.domain} · ${data.type} · ${data.answer?.length || 0} record(s) · ${data.ms}ms
          </div>
        </div>
      </div>`;

    // Show banner immediately; history loads below it
    out.innerHTML = banner;
    await loadDNSHistory(domain, true /* appendMode */);
  } catch (e) {
    out.innerHTML = `<div class="error-box">⚠ Network error: ${e.message}</div>`;
  }
}

async function loadDNSHistory(filterDomain, appendMode) {
  const domainInput = filterDomain || document.getElementById('hist-domain').value.trim() || '';
  const out = document.getElementById('hist-result');

  if (!appendMode) {
    out.innerHTML = `<div class="loading"><div class="spinner"></div><span>Loading history…</span></div>`;
  }

  try {
    const url = domainInput
      ? `/api/history/query?domain=${encodeURIComponent(domainInput)}`
      : '/api/history/query';
    const res = await fetch(url);
    const data = await res.json();

    const records = data.records || [];

    if (records.length === 0) {
      const emptyHtml = `
        <div class="empty">
          <div class="empty-icon">📭</div>
          <p>No history found${domainInput ? ' for ' + domainInput : ''}.<br>
          Use the Snapshot button to start recording DNS state over time.</p>
        </div>`;
      if (appendMode) {
        out.insertAdjacentHTML('beforeend', emptyHtml);
      } else {
        out.innerHTML = emptyHtml;
      }
      return;
    }

    renderDNSHistory(data, domainInput, appendMode);
  } catch (e) {
    const errHtml = `<div class="error-box">⚠ ${e.message}</div>`;
    if (appendMode) {
      out.insertAdjacentHTML('beforeend', errHtml);
    } else {
      out.innerHTML = errHtml;
    }
  }
}

function renderDNSHistory(data, filterDomain, appendMode) {
  const out = document.getElementById('hist-result');

  const records  = data.records  || [];
  const timeline = data.timeline || {};

  // Stats
  const domains = [...new Set(records.map(r => r.domain))];
  const changes = records.filter(r => r.changed).length;
  const errors  = records.filter(r => r.error).length;

  // Trend chart: queries per hour (last 24h)
  const trendChart = buildTrendChart(records);

  // Timeline groups
  const groups = Object.entries(timeline).map(([key, entries]) => {
    if (!Array.isArray(entries) || entries.length === 0) return '';
    const [domain, type] = key.split('|');
    const changeCount = entries.filter(e => e.changed).length;

    const entryItems = entries.slice(-8).reverse().map((e, idx, arr) => {
      const isFirst = idx === arr.length - 1;
      const dotClass = isFirst ? 'first' : e.changed ? 'changed' : 'same';
      const vals = e.answer || [];
      const valChips = vals.map((v, vi) => {
        const isNew = e.changed && vi === 0;
        return `<span class="hist-val-chip${isNew ? ' new-val' : ''}">${(v.value || '').substring(0, 40) || '?'}</span>`;
      }).join('');

      return `
        <div class="hist-entry">
          <div class="hist-entry-line"></div>
          <div class="hist-dot ${dotClass}"></div>
          <div class="hist-entry-content">
            <div class="hist-entry-time">
              ${formatRelTime(e.timestamp)}
              ${e.changed ? '<span class="hist-change-badge">CHANGED</span>' : ''}
              ${e.error ? '<span style="color:var(--red);font-size:10px">⚠ error</span>' : ''}
            </div>
            <div class="hist-entry-values">
              ${vals.length ? valChips : `<span style="font-size:11px;color:var(--text3)">${e.error || 'No records'}</span>`}
            </div>
          </div>
        </div>`;
    }).join('');

    return `
      <div class="hist-key-group">
        <div class="hist-key-header">
          <div class="hist-key-name">
            <span class="hist-type-chip">${type || ''}</span>
            <span style="margin-left:8px">${domain || ''}</span>
          </div>
          <div class="hist-key-meta">
            ${entries.length} snapshot${entries.length !== 1 ? 's' : ''}
            ${changeCount ? ` · <span style="color:var(--amber)">${changeCount} change${changeCount !== 1 ? 's' : ''}</span>` : ''}
          </div>
        </div>
        ${entryItems}
      </div>`;
  }).join('');

  // IP change frequency insight
  const insights = buildInsights(records);

  const historyHtml = `
    <div class="hist-stats">
      <div class="hist-stat">
        <div class="hist-stat-num">${records.length}</div>
        <div class="hist-stat-label">Snapshots</div>
      </div>
      <div class="hist-stat">
        <div class="hist-stat-num" style="color:var(--amber)">${changes}</div>
        <div class="hist-stat-label">Changes Detected</div>
      </div>
      <div class="hist-stat">
        <div class="hist-stat-num">${domains.length}</div>
        <div class="hist-stat-label">Domains Tracked</div>
      </div>
      <div class="hist-stat">
        <div class="hist-stat-num" style="color:var(--red)">${errors}</div>
        <div class="hist-stat-label">Errors</div>
      </div>
    </div>

    <div class="hist-trend-box">
      <div class="hist-trend-title">⟩ Snapshot Activity (last 24h)</div>
      ${trendChart}
    </div>

    ${insights}

    <div class="hist-timeline">
      <div class="hist-timeline-title">⟩ Record Timeline${filterDomain ? ' — ' + filterDomain.toUpperCase() : ''}</div>
      ${groups || '<div style="font-size:12px;color:var(--text3)">No records match filter</div>'}
    </div>

    <div style="margin-top:16px">
      <button class="btn btn-secondary" onclick="exportDNSHistory()">⊳ Export JSON</button>
      <button class="btn btn-danger" style="margin-left:8px" onclick="clearDNSHistory()">✕ Clear All History</button>
    </div>`;

  if (appendMode) {
    out.insertAdjacentHTML('beforeend', historyHtml);
  } else {
    out.innerHTML = historyHtml;
  }
}

function buildInsights(records) {
  const ipChanges = {};
  for (const r of records) {
    if (r.type !== 'A' || !r.answer) continue;
    const key = r.domain;
    if (!ipChanges[key]) ipChanges[key] = new Set();
    r.answer.forEach(a => { if (a.value) ipChanges[key].add(a.value); });
  }

  const volatile = Object.entries(ipChanges)
    .filter(([, ips]) => ips.size > 1)
    .map(([domain, ips]) => ({ domain, uniqueIPs: ips.size, ips: [...ips] }));

  if (!volatile.length) return '';

  return `
    <div class="hist-trend-box" style="margin-bottom:20px">
      <div class="hist-trend-title">⟩ IP Volatility Insight</div>
      ${volatile.map(v => `
        <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;padding:8px;background:var(--bg3);border-radius:6px">
          <span style="color:var(--amber);font-size:13px">⚠</span>
          <div>
            <div style="font-size:12px;color:var(--text)">${v.domain}</div>
            <div style="font-size:11px;color:var(--text3);margin-top:2px">${v.uniqueIPs} unique IPs observed: ${v.ips.join(', ')}</div>
          </div>
        </div>`).join('')}
    </div>`;
}

function buildTrendChart(records) {
  const now = Date.now();
  const buckets = Array.from({ length: 24 }, (_, i) => ({ hour: 23 - i, count: 0 }));
  for (const r of records) {
    const ts = toMs(r.timestamp);
    const hoursAgo = Math.floor((now - ts) / 3600000);
    if (hoursAgo >= 0 && hoursAgo < 24) buckets[23 - hoursAgo].count++;
  }

  const max = Math.max(...buckets.map(b => b.count), 1);
  const W = 720, H = 100, PAD = 10;
  const bw = (W - PAD * 2) / 24;

  const bars = buckets.map((b, i) => {
    const bh = Math.max(2, (b.count / max) * (H - PAD * 2));
    const x = PAD + i * bw;
    const y = H - PAD - bh;
    const color = b.count > 0 ? 'var(--accent)' : 'var(--border)';
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(bw - 2).toFixed(1)}" height="${bh.toFixed(1)}" fill="${color}" opacity="0.7" rx="2">
      <title>${b.count} snapshot${b.count !== 1 ? 's' : ''}, ${b.hour}h ago</title></rect>`;
  }).join('');

  const labels = [0, 6, 12, 18, 23].map(i => {
    const x = PAD + i * bw + bw / 2;
    return `<text x="${x.toFixed(1)}" y="${H}" font-size="8" fill="var(--text3)" text-anchor="middle">${buckets[i].hour}h ago</text>`;
  }).join('');

  return `<svg viewBox="0 0 ${W} ${H + 10}" class="hist-trend-svg">${bars}${labels}</svg>`;
}

function formatRelTime(ts) {
  const diff = Date.now() - toMs(ts);
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24)  return `${hrs}h ago`;
  return `${days}d ago`;
}

/* ── Renamed to avoid conflict with history.js's clearHistory() ── */
async function clearDNSHistory() {
  if (!confirm('Clear all DNS history? This cannot be undone.')) return;
  try {
    await fetch('/api/history', { method: 'DELETE' });
    document.getElementById('hist-result').innerHTML = `
      <div class="empty"><div class="empty-icon">🗑</div><p>History cleared.</p></div>`;
  } catch (e) {
    document.getElementById('hist-result').innerHTML =
      `<div class="error-box">⚠ Failed to clear history: ${e.message}</div>`;
  }
}
function exportDNSHistory() {
  fetch('/api/history/query')
    .then(r => {
      if (!r.ok) throw new Error(`Server returned ${r.status}`);
      return r.json();
    })
    .then(data => {
      const records = data.records || [];
      const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'dns-history.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    })
    .catch(e => alert(`Export failed: ${e.message}`));
}