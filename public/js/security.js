/* ============================================================
   JS/SECURITY.JS — DNS Security & Threat Detection
   ============================================================ */
'use strict';
//security.js
async function runSecurityScan() {
  const domain = document.getElementById('sec-domain').value.trim();
  if (!domain) return;

  const out = document.getElementById('sec-result');
  out.innerHTML = `<div class="loading"><div class="spinner"></div><span>Analyzing domain security…</span></div>`;

  try {
    const res = await fetch(`/api/security?domain=${encodeURIComponent(domain)}`);
    const data = await res.json();
    if (data.error) { out.innerHTML = `<div class="error-box">⚠ ${data.error}</div>`; return; }
    renderSecurityResult(data);
  } catch (e) {
    out.innerHTML = `<div class="error-box">⚠ Network error: ${e.message}</div>`;
  }
}

function renderSecurityResult(data) {
  const out = document.getElementById('sec-result');

  const scoreColor = data.riskScore < 15 ? 'var(--green)' : data.riskScore < 40 ? 'var(--accent)' : data.riskScore < 70 ? 'var(--amber)' : 'var(--red)';
  const threatDesc = {
    clean: 'No significant threats detected',
    'low-risk': 'Minor issues found — monitor recommended',
    suspicious: 'Multiple warning signals — verify carefully',
    malicious: 'High risk — potential phishing or malware'
  }[data.threatLevel] || '';

  const threatIcons = { clean: '✅', 'low-risk': '🔵', suspicious: '⚠️', malicious: '🚨' };

  // Score ring SVG
  const radius = 38, circ = 2 * Math.PI * radius;
  const filled = (data.riskScore / 100) * circ;
  const scoreRing = `
    <svg width="90" height="90" viewBox="0 0 90 90">
      <circle cx="45" cy="45" r="${radius}" fill="none" stroke="var(--bg3)" stroke-width="6"/>
      <circle cx="45" cy="45" r="${radius}" fill="none" stroke="${scoreColor}" stroke-width="6"
        stroke-dasharray="${filled.toFixed(1)} ${(circ - filled).toFixed(1)}"
        stroke-linecap="round" style="transition:stroke-dasharray 1s ease"/>
    </svg>`;

  // Flags
  const flagIcons = { danger: '🚨', warning: '⚠️', info: 'ℹ️' };
  const flags = data.flags.length
    ? data.flags.map(f => `
        <div class="sec-flag ${f.type}">
          <div class="sec-flag-icon">${flagIcons[f.type] || 'ℹ️'}</div>
          <div class="sec-flag-msg">${f.msg}</div>
        </div>`).join('')
    : `<div class="sec-flag info"><div class="sec-flag-icon">✅</div><div class="sec-flag-msg">No security flags found</div></div>`;

  // Checks grid
  const chk = data.checks;
  const checkItems = [
    { icon: '📧', name: 'MX Record',   val: chk.hasMX,    yes: 'Present', no: 'Missing' },
    { icon: '🔐', name: 'SPF Record',  val: chk.validSPF, yes: 'Configured', no: 'Missing' },
    { icon: '📋', name: 'DMARC',       val: chk.hasDMARC, yes: 'Configured', no: 'Missing' },
    { icon: '🔒', name: 'CAA Record',  val: chk.hasCAA,   yes: 'Present', no: 'Missing' },
    { icon: '🧬', name: 'DNS Consistent', val: chk.spoofing?.consistent, yes: 'Consistent', no: 'Inconsistent' },
    { icon: '🌐', name: 'Domain Length', val: chk.suspiciousPatterns?.filter(p => p.includes('long')).length === 0, yes: 'Normal', no: 'Unusual' },
  ].map(c => {
    const cls = c.val ? 'pass' : 'fail';
    return `
      <div class="sec-check-item">
        <div class="sec-check-icon">${c.icon}</div>
        <div>
          <div class="sec-check-name">${c.name}</div>
          <div class="sec-check-val ${cls}">${c.val ? c.yes : c.no}</div>
        </div>
      </div>`;
  }).join('');

  // Spoofing detail
  const spoofBox = `
    <div class="sec-spoof-box">
      <div class="sec-spoof-title">⟩ DNS Response Consistency Check (${chk.spoofing?.responses?.length || 0} samples)</div>
      <div class="sec-spoof-responses">
        ${chk.spoofing?.responses?.length
          ? chk.spoofing.responses.map((r, i) =>
              `<div class="sec-spoof-resp">Sample ${i + 1}: ${r}</div>`).join('')
          : '<div class="sec-spoof-resp">No responses recorded</div>'
        }
      </div>
      <div style="font-size:11px;margin-top:8px;color:${chk.spoofing?.consistent ? 'var(--green)' : 'var(--red)'}">
        ${chk.spoofing?.consistent ? '✓ All responses are consistent' : '✗ Inconsistent responses detected — possible DNS spoofing'}
      </div>
    </div>`;

  // Suspicious patterns detail
  const patternsDetail = chk.suspiciousPatterns?.length
    ? `<div style="margin-top:14px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px">
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">⟩ Pattern Analysis</div>
        ${chk.suspiciousPatterns.map(p =>
          `<div style="font-size:11px;padding:4px 0;border-bottom:1px solid var(--border);color:var(--amber)">⚠ ${p}</div>`
        ).join('')}
      </div>`
    : `<div style="margin-top:14px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px;font-size:11px;color:var(--green)">✓ No suspicious patterns detected in domain name</div>`;

  out.innerHTML = `
    <div class="sec-score-wrap">
      <div class="sec-score-ring">
        ${scoreRing}
        <div class="sec-score-ring-val">
          <div class="sec-score-num" style="color:${scoreColor}">${data.riskScore}</div>
          <div class="sec-score-label">Risk</div>
        </div>
      </div>
      <div>
        <div class="sec-threat-level ${data.threatLevel}">${threatIcons[data.threatLevel]} ${data.threatLevel.toUpperCase().replace('-',' ')}</div>
        <div class="sec-threat-desc">${threatDesc}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:6px">Domain: <span style="color:var(--text)">${data.domain}</span></div>
      </div>
    </div>

    <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">⟩ Security Flags</div>
    <div class="sec-flags">${flags}</div>

    <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">⟩ Security Checks</div>
    <div class="sec-checks-grid">${checkItems}</div>

    ${spoofBox}
    ${patternsDetail}`;
}
