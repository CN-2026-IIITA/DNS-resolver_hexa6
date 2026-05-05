/* ============================================================
   JS/PERF.JS — DNS Performance Analytics Dashboard
   ============================================================ */
'use strict';
//perf.js
async function runPerfTest() {
  const domain = document.getElementById('perf-domain').value.trim();
  if (!domain) return;

  const out = document.getElementById('perf-result');
  out.innerHTML = `<div class="loading"><div class="spinner"></div><span>Benchmarking DNS providers (5 samples each)…</span></div>`;

  try {
    const res = await fetch(`/api/perf?domain=${encodeURIComponent(domain)}`);
    const data = await res.json();
    if (data.error) { out.innerHTML = `<div class="error-box">⚠ ${data.error}</div>`; return; }
    renderPerfResults(data);
  } catch (e) {
    out.innerHTML = `<div class="error-box">⚠ Network error: ${e.message}</div>`;
  }
}

function renderPerfResults(data) {
  const out = document.getElementById('perf-result');
  const fastest = data.measurements[0];

  const providerColors = {
    Google: '#4285F4', Cloudflare: '#F48120', Quad9: '#a855f7', OpenDNS: '#00d4ff'
  };

  // Find max avg for bar scaling
  const maxAvg = Math.max(...data.measurements.filter(m => m.avg).map(m => m.avg), 1);

  // Cards HTML
  const cards = data.measurements.map((m, i) => {
    const color = providerColors[m.provider] || m.color || '#00d4ff';
    const isFastest = i === 0 && m.avg !== null;
    const maxSample = Math.max(...(m.samples.filter(Boolean)), 1);
    const sampleBars = m.samples.map(s => {
      if (s === null) return `<div class="perf-sample-bar" style="background:var(--border);height:4px"></div>`;
      const h = Math.round((s / maxSample) * 22);
      return `<div class="perf-sample-bar" style="background:${color};height:${Math.max(4,h)}px"></div>`;
    }).join('');

    const latencyColor = !m.avg ? 'var(--text3)' : m.avg < 50 ? 'var(--green)' : m.avg < 120 ? 'var(--accent)' : m.avg < 250 ? 'var(--amber)' : 'var(--red)';

    return `
      <div class="perf-card${isFastest ? ' fastest' : ''}">
        <div class="perf-card-accent" style="background:${color}"></div>
        <div class="perf-provider">
          ${m.provider}${isFastest ? '<span class="fastest-badge">⚡ Fastest</span>' : ''}
        </div>
        <div class="perf-provider-ip">${m.ip}</div>
        <div class="perf-latency" style="color:${latencyColor}">
          ${m.avg !== null ? m.avg : '—'}<span class="perf-latency-unit"> ms</span>
        </div>
        <div class="perf-samples">${sampleBars}</div>
        <div class="perf-meta">
          <span>Min <b>${m.min ?? '—'}ms</b></span>
          <span>Max <b>${m.max ?? '—'}ms</b></span>
          <span>Loss <b>${m.packetLoss}%</b></span>
          <span>OK <b>${m.successRate}%</b></span>
        </div>
        <div class="perf-bar-track">
          <div class="perf-bar-fill" style="background:${color};width:${m.avg ? Math.round((m.avg/maxAvg)*100) : 0}%"></div>
        </div>
      </div>`;
  }).join('');

  // Bar chart HTML
  const barChart = data.measurements.map(m => {
    const color = providerColors[m.provider] || '#00d4ff';
    const pct = m.avg ? Math.round((m.avg / maxAvg) * 100) : 0;
    return `
      <div class="perf-bar-chart-row">
        <div class="perf-bar-chart-label">${m.provider}</div>
        <div class="perf-bar-chart-track">
          <div class="perf-bar-chart-fill" style="background:${color};width:${pct}%">${m.avg ? m.avg+'ms' : ''}</div>
        </div>
        <div class="perf-bar-chart-val">${m.successRate}% OK</div>
      </div>`;
  }).join('');

  // Line chart (samples per provider)
  const lineChart = buildLineChart(data.measurements, providerColors);

  out.innerHTML = `
    <div class="perf-winner">
      <div class="perf-winner-icon">🏆</div>
      <div>
        <div class="perf-winner-label">Fastest DNS for ${data.domain}</div>
        <div class="perf-winner-name">${fastest.provider} <span style="font-size:14px;color:var(--text3)">(${fastest.ip})</span></div>
        <div class="perf-winner-ms">Average: ${fastest.avg}ms · Success rate: ${fastest.successRate}%</div>
      </div>
    </div>
    <div class="perf-grid">${cards}</div>
    <div class="perf-charts">
      <div class="perf-chart-box">
        <div class="perf-chart-title">⊳ Avg Latency Comparison</div>
        <div class="perf-bar-chart">${barChart}</div>
      </div>
      <div class="perf-chart-box">
        <div class="perf-chart-title">⊳ Sample Latency Trend (per query)</div>
        ${lineChart}
      </div>
    </div>`;
}

function buildLineChart(measurements, colors) {
  const W = 360, H = 150, PAD = 30;
  const n = measurements[0]?.samples?.length || 5;
  // Find global max
  const allVals = measurements.flatMap(m => m.samples.filter(Boolean));
  const maxVal = Math.max(...allVals, 1);
  const minVal = Math.min(...allVals, 0);
  const range = maxVal - minVal || 1;

  const xScale = (i) => PAD + (i / (n - 1)) * (W - PAD * 2);
  const yScale = (v) => H - PAD - ((v - minVal) / range) * (H - PAD * 2);

  let svgPaths = '';
  let svgDots = '';
  let legend = '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:8px">';

  for (const m of measurements) {
    const color = colors[m.provider] || '#00d4ff';
    const valid = m.samples.map((s, i) => s !== null ? { x: xScale(i), y: yScale(s), v: s } : null).filter(Boolean);
    if (valid.length < 2) continue;
    const d = valid.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    svgPaths += `<path d="${d}" stroke="${color}" stroke-width="1.5" fill="none" opacity="0.8"/>`;
    svgDots += valid.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="${color}"><title>${p.v}ms</title></circle>`).join('');
    legend += `<span style="font-size:10px;color:${color};display:flex;align-items:center;gap:4px"><span style="width:12px;height:2px;background:${color};display:inline-block"></span>${m.provider}</span>`;
  }
  legend += '</div>';

  // Y axis labels
  const yLabels = [maxVal, Math.round((maxVal + minVal) / 2), minVal].map((v, i) => {
    const y = yScale(v);
    return `<text x="0" y="${y.toFixed(1)}" font-size="8" fill="var(--text3)" dominant-baseline="middle">${v}ms</text>`;
  }).join('');

  // X axis labels
  const xLabels = Array.from({ length: n }, (_, i) =>
    `<text x="${xScale(i).toFixed(1)}" y="${H - 6}" font-size="8" fill="var(--text3)" text-anchor="middle">#${i + 1}</text>`
  ).join('');

  const gridLines = [0.25, 0.5, 0.75, 1].map(f => {
    const y = PAD + (1 - f) * (H - PAD * 2);
    return `<line x1="${PAD}" y1="${y.toFixed(1)}" x2="${W - PAD}" y2="${y.toFixed(1)}" stroke="var(--border)" stroke-width="0.5"/>`;
  }).join('');

  return `
    <svg viewBox="0 0 ${W} ${H}" class="perf-line-svg">
      ${gridLines}
      ${yLabels}
      ${svgPaths}
      ${svgDots}
      ${xLabels}
    </svg>
    ${legend}`;
}
