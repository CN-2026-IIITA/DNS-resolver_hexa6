/* ============================================================
   JS/GEOMAP.JS — Global DNS Map Visualization (Fixed)
   ============================================================ */
'use strict';

async function runGeoMap() {
  const domain = document.getElementById('geo-domain').value.trim();
  if (!domain) return;
  const out = document.getElementById('geo-result');
  out.innerHTML = `<div class="loading"><div class="spinner"></div><span>Resolving and geolocating DNS records…</span></div>`;
  try {
    const res = await fetch(`/api/geomap?domain=${encodeURIComponent(domain)}`);
    const data = await res.json();
    if (data.error) { out.innerHTML = `<div class="error-box">⚠ ${data.error}</div>`; return; }
    renderGeoMap(data);
  } catch (e) {
    out.innerHTML = `<div class="error-box">⚠ Network error: ${e.message}</div>`;
  }
}

const MAP_W = 800, MAP_H = 400;

// Equirectangular projection
function latLonToXY(lat, lon) {
  const x = ((lon + 180) / 360) * MAP_W;
  const y = ((90 - lat) / 180) * MAP_H;
  return { x: +x.toFixed(1), y: +y.toFixed(1) };
}

const COUNTRY_FLAGS = {
  US:'🇺🇸',DE:'🇩🇪',GB:'🇬🇧',FR:'🇫🇷',JP:'🇯🇵',CN:'🇨🇳',IN:'🇮🇳',CA:'🇨🇦',
  AU:'🇦🇺',BR:'🇧🇷',RU:'🇷🇺',NL:'🇳🇱',SG:'🇸🇬',KR:'🇰🇷',SE:'🇸🇪',NO:'🇳🇴',
  FI:'🇫🇮',DK:'🇩🇰',CH:'🇨🇭',AT:'🇦🇹',IT:'🇮🇹',ES:'🇪🇸',PL:'🇵🇱',UA:'🇺🇦',
  ZA:'🇿🇦',MX:'🇲🇽',AR:'🇦🇷',HK:'🇭🇰',TW:'🇹🇼',IL:'🇮🇱',AE:'🇦🇪',ID:'🇮🇩',
  MY:'🇲🇾',TH:'🇹🇭',PK:'🇵🇰',IE:'🇮🇪',PT:'🇵🇹',BE:'🇧🇪',CZ:'🇨🇿',
};

// Convert array of [lon, lat] pairs into SVG polygon points string
function pts(coords) {
  return coords.map(([lon, lat]) => {
    const {x, y} = latLonToXY(lat, lon);
    return `${x},${y}`;
  }).join(' ');
}

function buildContinents() {
  const fill = '#0d1e33';
  const stroke = '#1a2d44';
  // Polygons defined as [longitude, latitude] pairs
  const shapes = [
    // North America (simplified)
    pts([[-168,72],[-140,72],[-130,54],[-124,48],[-117,32],[-110,22],[-86,15],[-78,8],[-75,10],
         [-62,14],[-55,22],[-58,45],[-64,44],[-66,45],[-62,47],[-68,48],[-70,47],[-76,44],
         [-82,42],[-83,46],[-88,48],[-90,47],[-96,49],[-110,49],[-120,49],[-130,54],[-140,60],
         [-150,60],[-158,62],[-164,66],[-168,70]]),
    // Greenland
    pts([[-74,83],[-20,83],[-18,76],[-20,70],[-38,65],[-55,62],[-68,66],[-74,78]]),
    // South America
    pts([[-80,12],[-78,5],[-72,0],[-70,-5],[-72,-18],[-75,-28],[-72,-40],[-68,-55],
         [-62,-55],[-57,-50],[-50,-32],[-45,-22],[-42,-14],[-50,-5],[-53,0],[-60,5],[-66,10],[-72,12]]),
    // Europe (western + eastern)
    pts([[-10,36],[-8,44],[-4,44],[-2,52],[-5,58],[-3,57],[0,58],[5,58],[8,56],[10,56],
         [14,55],[18,55],[22,58],[26,58],[28,56],[30,58],[28,68],[22,71],[15,70],[10,70],
         [4,62],[0,62],[-4,58],[-8,56],[-10,44],[-5,38],[0,38],[5,38],[10,38],[14,38],
         [18,40],[22,38],[26,40],[28,42],[24,44],[20,45],[15,44],[10,44],[8,46],
         [6,46],[4,44],[0,44],[-4,44],[-8,44]]),
    // Africa
    pts([[-18,36],[-16,20],[-18,14],[-15,10],[-15,4],[-10,0],[-4,-4],[0,-10],
         [8,-20],[14,-34],[18,-34],[24,-34],[28,-32],[34,-26],[40,-14],[42,-10],
         [44,-8],[50,0],[50,8],[44,12],[42,18],[40,22],[36,28],[32,32],[26,34],[20,36],[14,36],[8,36]]),
    // Asia (main landmass)
    pts([[26,70],[50,72],[80,72],[100,72],[120,72],[140,70],[148,60],[140,50],
         [135,44],[130,36],[122,22],[116,14],[110,4],[104,0],[100,4],[96,8],
         [90,20],[84,26],[78,32],[72,36],[66,40],[62,42],[56,42],[50,40],
         [44,38],[38,38],[32,38],[28,42],[26,50],[24,56],[26,62],[26,68]]),
    // Indian subcontinent bump
    pts([[66,22],[68,22],[70,20],[72,18],[74,14],[76,10],[80,8],[82,10],[84,12],
         [82,16],[80,20],[78,24],[76,26],[74,26],[72,24],[70,24],[68,24]]),
    // Australia
    pts([[114,-22],[116,-14],[120,-14],[126,-12],[130,-12],[136,-12],[138,-14],
         [136,-20],[132,-26],[132,-32],[128,-36],[122,-34],[116,-30],[114,-26]]),
    // Japan (Honshu)
    pts([[130,32],[132,34],[134,34],[136,36],[138,38],[140,40],[140,38],[138,36],
         [136,34],[134,33],[132,33],[130,32]]),
    // UK
    pts([[-6,58],[-4,56],[-2,52],[-2,51],[-4,50],[-5,50],[-4,52],[-4,54],[-4,56],[-5,57],[-6,58]]),
    // Ireland
    pts([[-10,54],[-8,52],[-6,52],[-6,54],[-8,55],[-10,54]]),
    // New Zealand (S island)
    pts([[170,-42],[172,-44],[174,-46],[172,-46],[170,-44],[168,-43],[170,-42]]),
  ];

  return shapes.map(p =>
    `<polygon points="${p}" fill="${fill}" stroke="${stroke}" stroke-width="0.5" opacity="0.95"/>`
  ).join('\n');
}

function buildGrid() {
  let out = '';
  // Lat lines
  for (const lat of [-60, -30, 0, 30, 60]) {
    const {y} = latLonToXY(lat, 0);
    out += `<line x1="0" y1="${y}" x2="${MAP_W}" y2="${y}" stroke="${lat===0?'#1e3050':'#0e1c2e'}" stroke-width="${lat===0?0.8:0.4}" ${lat===0?'stroke-dasharray="8,5"':''}/>`;
    out += `<text x="3" y="${y-2}" font-size="7" fill="#253545" font-family="monospace">${lat}°</text>`;
  }
  // Lon lines
  for (const lon of [-120,-60,0,60,120]) {
    const {x} = latLonToXY(0, lon);
    out += `<line x1="${x}" y1="0" x2="${x}" y2="${MAP_H}" stroke="${lon===0?'#1e3050':'#0e1c2e'}" stroke-width="${lon===0?0.8:0.4}" ${lon===0?'stroke-dasharray="8,5"':''}/>`;
  }
  return out;
}

function renderGeoMap(data) {
  const out = document.getElementById('geo-result');

  const allGeo = [
    ...data.geolocations.map(g => ({ ...g, kind: 'ip' })),
    ...data.nameserverGeo.map(g => ({ ...g, kind: 'ns' })),
  ];

  const ipColors = ['#00d4ff','#00ff9d','#ffb830','#ff6b6b','#a78bfa'];
  let ipIdx = 0;
  let pins = '', connLines = '';
  let firstXY = null;

  for (const g of allGeo) {
    const geo = g.geo;
    if (!geo || geo.status !== 'success' || !geo.lat || !geo.lon) continue;

    const isNS = g.kind === 'ns';
    const color = isNS ? '#a855f7' : ipColors[ipIdx++ % ipColors.length];
    const {x, y} = latLonToXY(geo.lat, geo.lon);
    const tipText = `${isNS ? '📡 NS' : '🌐 IP'}: ${isNS ? (g.name||g.ip) : g.ip} | ${COUNTRY_FLAGS[geo.countryCode]||'🌍'} ${geo.city}, ${geo.country} | ${geo.isp||''}`;

    if (!firstXY) { firstXY = {x, y}; }
    else {
      connLines += `<line x1="${firstXY.x}" y1="${firstXY.y}" x2="${x}" y2="${y}" stroke="${color}" stroke-width="0.8" opacity="0.3" stroke-dasharray="4,3"/>`;
    }

    pins += `
      <g class="geo-map-pin" data-tip="${tipText.replace(/"/g,'&quot;')}">
        <circle cx="${x}" cy="${y}" r="13" fill="${color}" opacity="0.07"/>
        <circle cx="${x}" cy="${y}" r="7"  fill="${color}" opacity="0.18"/>
        <circle cx="${x}" cy="${y}" r="4.5" fill="${color}" opacity="0.9"/>
        <circle cx="${x}" cy="${y}" r="2"   fill="#fff" opacity="0.85"/>
        ${isNS ? `<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="${color}" stroke-width="1.2" opacity="0.55"/>` : ''}
      </g>`;
  }

  // Sidebar
  const sideColors = ['#00d4ff','#00ff9d','#ffb830','#ff6b6b','#a78bfa'];
  const ipRows = data.geolocations.length
    ? data.geolocations.map((g,i) => {
        const geo = g.geo;
        const ok = geo?.status === 'success';
        const flag = COUNTRY_FLAGS[geo?.countryCode] || '🌍';
        return `<div class="geo-ip-row">
          <div class="geo-ip-dot" style="background:${sideColors[i%sideColors.length]}"></div>
          <div>
            <div class="geo-ip-addr">${g.ip}</div>
            <div class="geo-ip-loc">${flag} ${ok ? `${geo.city||''}, ${geo.country||'Unknown'}` : 'Location unavailable'}</div>
            <div class="geo-ip-isp">${ok ? (geo.isp||'') : ''}</div>
          </div></div>`;
      }).join('')
    : '<div style="font-size:12px;color:var(--text3)">No IPv4 records</div>';

  const nsRows = data.nameserverGeo.length
    ? data.nameserverGeo.map(g => {
        const geo = g.geo;
        const ok = geo?.status === 'success';
        const flag = COUNTRY_FLAGS[geo?.countryCode] || '🌍';
        return `<div class="geo-ns-row">
          <div>📡</div>
          <div class="geo-ns-name" title="${g.name}">${g.name}</div>
          <div class="geo-ns-country">${ok ? flag+' '+(geo.country||'?') : '?'}</div></div>`;
      }).join('')
    : '<div style="font-size:12px;color:var(--text3)">No NS geo data</div>';

  const recSummary = ['ipv4','ipv6','ns','mx'].map(k => {
    const vals = data.records[k]||[];
    if (!vals.length) return '';
    return `<div style="margin-bottom:10px">
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">${k.toUpperCase()} (${vals.length})</div>
      ${vals.map(v=>`<div style="font-size:11px;color:var(--text2);padding:3px 0;border-bottom:1px solid var(--border);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${v}</div>`).join('')}
    </div>`;
  }).join('');

  out.innerHTML = `
    <div class="geo-layout">
      <div>
        <div class="geo-map-wrap" style="position:relative">
          <div class="geo-map-title">⟩ Global DNS Distribution — ${data.domain}</div>
          <svg viewBox="0 0 ${MAP_W} ${MAP_H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;border-radius:0 0 8px 8px">
            <rect width="${MAP_W}" height="${MAP_H}" fill="#060d1a"/>
            ${buildGrid()}
            ${buildContinents()}
            ${connLines}
            ${pins}
          </svg>
          <div id="geo-float-tip" style="display:none;position:absolute;background:#0f1520;border:1px solid #243550;border-radius:6px;padding:7px 11px;font-size:11px;color:#e2eaf8;pointer-events:none;z-index:20;white-space:nowrap;max-width:300px;box-shadow:0 4px 16px rgba(0,0,0,.6)"></div>
        </div>
        <div style="display:flex;gap:16px;margin-top:10px;font-size:11px;color:var(--text3);flex-wrap:wrap">
          <span style="display:flex;align-items:center;gap:5px"><span style="width:8px;height:8px;border-radius:50%;background:#00d4ff;display:inline-block"></span>IP Address</span>
          <span style="display:flex;align-items:center;gap:5px"><span style="width:8px;height:8px;border-radius:50%;background:#a855f7;display:inline-block"></span>Nameserver</span>
          <span>${allGeo.filter(g=>g.geo?.status==='success').length} location(s) mapped</span>
        </div>
      </div>
      <div class="geo-sidebar">
        <div class="geo-section"><div class="geo-section-title">🌐 IP Locations</div>${ipRows}</div>
        <div class="geo-section"><div class="geo-section-title">📡 Nameserver Locations</div>${nsRows}</div>
        <div class="geo-section"><div class="geo-section-title">📋 DNS Records</div>${recSummary||'<div style="font-size:12px;color:var(--text3)">No records found</div>'}</div>
      </div>
    </div>`;

  // Tooltip
  const tip = document.getElementById('geo-float-tip');
  document.querySelectorAll('.geo-map-pin').forEach(pin => {
    pin.style.cursor = 'pointer';
    pin.addEventListener('mouseenter', () => { tip.textContent = pin.dataset.tip; tip.style.display = 'block'; });
    pin.addEventListener('mousemove', e => {
      const wrap = tip.closest ? tip.parentElement : document.querySelector('.geo-map-wrap');
      const rect = out.querySelector('.geo-map-wrap').getBoundingClientRect();
      let lx = e.clientX - rect.left + 16;
      let ly = e.clientY - rect.top  + 16;
      if (lx + 310 > rect.width)  lx = e.clientX - rect.left - 220;
      if (ly + 70  > rect.height) ly = e.clientY - rect.top  - 55;
      tip.style.left = lx + 'px';
      tip.style.top  = ly + 'px';
    });
    pin.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
  });
}