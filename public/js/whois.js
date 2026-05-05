/* ============================================================
   JS/WHOIS.JS — Domain WHOIS / DNS info lookup
   ============================================================ */

'use strict';

async function doWhois() {
  const domain = document.getElementById('whois-input').value.trim();
  if (!domain) return;

  const area = document.getElementById('whois-area');
  area.innerHTML = `<div class="loading"><div class="spinner"></div>Looking up ${domain}...</div>`;

  try {
    const res = await fetch(`/api/whois?domain=${encodeURIComponent(domain)}`);
    const d   = await res.json();

    if (d.error) { area.innerHTML = `<div class="error-box">${d.error}</div>`; return; }

    const ns  = (d.nameservers || []).join('<br>') || '—';
    const mx  = (d.mailServers || []).join('<br>') || 'None';
    const ipv4 = (d.ipv4 || []).join('<br>') || '—';
    const ipv6 = (d.ipv6 || []).join('<br>') || 'Not configured';

    area.innerHTML = `
      <div class="whois-grid">
        <div class="whois-card">
          <div class="whois-card-title">Registration Info</div>
          <div class="whois-row">
            <span class="whois-key">Domain</span>
            <span class="whois-val green">${d.domain}</span>
          </div>
          <div class="whois-row">
            <span class="whois-key">Registrar (hint)</span>
            <span class="whois-val">${d.registrarHint}</span>
          </div>
          <div class="whois-row">
            <span class="whois-key">SOA Serial</span>
            <span class="whois-val">${d.soa?.serial || '—'}</span>
          </div>
          <div class="whois-row">
            <span class="whois-key">Admin Email</span>
            <span class="whois-val">${d.soa?.adminEmail || '—'}</span>
          </div>
          <div class="whois-row">
            <span class="whois-key">Primary NS</span>
            <span class="whois-val">${d.soa?.primaryNs || '—'}</span>
          </div>
        </div>

        <div class="whois-card">
          <div class="whois-card-title">Nameservers &amp; IPs</div>
          <div class="whois-row">
            <span class="whois-key">Nameservers</span>
            <span class="whois-val green">${ns}</span>
          </div>
          <div class="whois-row">
            <span class="whois-key">IPv4</span>
            <span class="whois-val">${ipv4}</span>
          </div>
          <div class="whois-row">
            <span class="whois-key">IPv6</span>
            <span class="whois-val ${d.ipv6?.length ? '' : 'amber'}">${ipv6}</span>
          </div>
          <div class="whois-row">
            <span class="whois-key">TTL</span>
            <span class="whois-val">${d.ttl ? d.ttl + 's' : '—'}</span>
          </div>
        </div>

        <div class="whois-card">
          <div class="whois-card-title">Mail &amp; Security</div>
          <div class="whois-row">
            <span class="whois-key">Mail Servers</span>
            <span class="whois-val green">${mx}</span>
          </div>
          <div class="whois-row">
            <span class="whois-key">SPF</span>
            <span class="whois-val ${d.hasSPF ? 'green' : 'red'}">
              ${d.hasSPF ? 'Configured' : 'Missing'}
              <span class="whois-tag ${d.hasSPF ? 'pass' : 'fail'}">${d.hasSPF ? 'PASS' : 'FAIL'}</span>
            </span>
          </div>
          <div class="whois-row">
            <span class="whois-key">DMARC</span>
            <span class="whois-val ${d.hasDMARC ? 'green' : 'red'}">
              ${d.hasDMARC ? 'Configured' : 'Missing'}
              <span class="whois-tag ${d.hasDMARC ? 'pass' : 'fail'}">${d.hasDMARC ? 'PASS' : 'FAIL'}</span>
            </span>
          </div>
          ${d.spf ? `
          <div class="whois-row whois-spf-raw">
            <span class="whois-key">SPF Record</span>
            <span class="whois-spf-val">${d.spf}</span>
          </div>` : ''}
        </div>

        ${d.soa ? `
        <div class="whois-card">
          <div class="whois-card-title">SOA Timers</div>
          <div class="whois-row"><span class="whois-key">Refresh</span><span class="whois-val">${d.soa.refresh}s</span></div>
          <div class="whois-row"><span class="whois-key">Retry</span>  <span class="whois-val">${d.soa.retry}s</span></div>
          <div class="whois-row"><span class="whois-key">Expire</span> <span class="whois-val">${d.soa.expire}s</span></div>
          <div class="whois-row"><span class="whois-key">Min TTL</span><span class="whois-val">${d.soa.minTtl}s</span></div>
        </div>` : ''}
      </div>`;

  } catch (e) {
    area.innerHTML = `<div class="error-box">Whois lookup failed: ${e.message}</div>`;
  }
}
