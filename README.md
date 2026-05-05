# 🌐 DNS Resolver — Global Internet Path Analyzer & DNS Intelligence Platform

> A full-stack DNS analysis tool built with **Node.js + Express + Vanilla JS** as a Computer Networks project.  
> Visualizes DNS resolution, network paths, security analysis, and global IP geolocation — all in one tab-based web app.

---

## 📌 Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Installation & Setup](#installation--setup)
6. [How It Works](#how-it-works)
7. [API Reference](#api-reference)
8. [CN Concepts Implemented](#cn-concepts-implemented)
9. [Screenshots](#screenshots)
10. [Team](#team)

---

## Project Overview

DNS Resolver is a web-based platform that lets you inspect, analyze, and visualize everything about a domain's DNS configuration. It was built as a Computer Networks course project to practically implement concepts like iterative DNS resolution, TCP socket programming, TTL-based caching, and network path tracing.

The app runs entirely locally — start the server, open your browser, and explore 13 different DNS and network features through a clean dark-themed UI.

---

## Features

| Tab | Feature | What it does |
|-----|---------|--------------|
| ⟩ Resolve | DNS Resolver | Resolves any domain with step-by-step iterative resolution visualization |
| ⟩ Cache | Cache Viewer | Shows in-memory DNS cache with live TTL countdown bars |
| ⟩ Compare | Iterative vs Recursive | Side-by-side comparison of both resolution methods |
| ⟩ History | Query History | Session-based log of all queries made |
| ⟩ Bulk | Bulk Resolver | Resolve up to 20 domains simultaneously |
| ⟩ Propagation | Propagation Check | Checks if DNS changes have propagated across 6 global resolvers |
| ⟩ Whois | Domain Info | Infers registration info, SPF, DMARC, SOA from DNS records |
| ⟩ Port Scan | Port Scanner | TCP port scanner for 15 common ports |
| ⟩ Health | DNS Health Audit | 9-point health check with scoring (0–100) |
| ⚡ Perf | Performance | Benchmarks latency across Google, Cloudflare, Quad9, OpenDNS |
| 🛡 Security | Threat Detection | Phishing pattern detection, homograph check, spoofing detection |
| 🗺 Map | Global DNS Map + Traceroute | Geolocates IPs on a world map + full traceroute path visualization |
| 📈 Trends | DNS History | Persistent snapshots of DNS records with change detection |

---

## Tech Stack

**Backend**
- Node.js — runtime
- Express.js — web server and REST API
- `dns` (built-in) — DNS resolution
- `net` (built-in) — TCP socket programming for port scanning
- `child_process` (built-in) — runs `traceroute` / `tracert` for network path
- `fs` (built-in) — persistent JSON storage for DNS history
- ip-api.com — free IP geolocation API (no key required)

**Frontend**
- Vanilla HTML, CSS, JavaScript — no frameworks
- Lazy loading — feature HTML/CSS loaded on first tab click
- Pure SVG — world map, charts, and graphs built without any charting library

---

## Project Structure

```
project/
├── server.js                  # All backend logic + API routes
├── dns_history.json           # Auto-created: persistent DNS snapshots
├── public/
│   ├── index.html             # Main shell — tab bar + container
│   ├── css/
│   │   ├── base.css           # Global design system, dark theme, variables
│   │   ├── components.css     # Shared components (cards, tables, badges)
│   │   └── features/          # Per-feature CSS (13 files)
│   ├── js/
│   │   ├── main.js            # Tab switching + lazy feature loader
│   │   ├── resolve.js         # DNS resolution + animated hop tree
│   │   ├── cache.js           # Cache viewer with TTL bars
│   │   ├── compare.js         # Iterative vs recursive comparison
│   │   ├── history.js         # Client-side session history
│   │   ├── bulk.js            # Bulk domain resolver
│   │   ├── propagation.js     # Propagation status UI
│   │   ├── whois.js           # Domain info display
│   │   ├── portscan.js        # Port scan results
│   │   ├── health.js          # Health audit checklist
│   │   ├── perf.js            # Performance benchmark charts
│   │   ├── security.js        # Security scan + risk gauge
│   │   ├── geomap.js          # World map + traceroute visualization
│   │   └── dnshistory.js      # DNS trends + snapshot timeline
│   └── features/              # HTML partials for each tab (13 files)
```

---

## Installation & Setup

### Prerequisites
- Node.js v16 or higher
- `traceroute` installed (Linux/Mac) or Windows (has `tracert` built-in)

### Steps

```bash
# 1. Clone or extract the project
cd project

# 2. Install dependencies
npm install express

# 3. Start the server
node server.js

# 4. Open in browser
# http://localhost:3000
```

> On Linux, if traceroute is not installed:
> ```bash
> sudo apt install traceroute
> ```

---

## How It Works

### DNS Resolution Flow

When you resolve a domain, the server simulates the full iterative DNS resolution process:

```
Browser → /api/resolve → server.js
                              │
                    ┌─────────▼──────────┐
                    │   Check Cache?     │ ← in-memory JS object
                    └─────────┬──────────┘
                         HIT ─┤─ MISS
                              │
                    ┌─────────▼──────────┐
                    │  Root Nameserver   │ ← simulated (real IPs used)
                    │  198.41.0.4        │   + artificial delay
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │  TLD Nameserver    │ ← simulated (.com/.net/.org etc.)
                    │  192.5.6.30        │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Authoritative NS  │ ← REAL lookup via Node dns module
                    │  ns1.google.com    │
                    └─────────┬──────────┘
                              │
                         Answer + TTL → stored in cache → returned to browser
```

### Caching

The cache is an in-memory JavaScript object. Every entry stores:
- The resolved records
- The TTL from the DNS response
- An `expiresAt` timestamp

On every lookup, expired entries are evicted automatically. The frontend shows a live TTL countdown bar per entry.

### Port Scanner

Uses Node's `net.Socket` to attempt a raw TCP connection to each port. If the 3-way handshake completes → port is **open**. If connection is refused or times out → port is **closed/filtered**. All 15 ports are scanned in parallel.

### Traceroute + Network Path Map

The server runs the OS-level `traceroute` (Linux) or `tracert` (Windows) command, parses each hop's IP and latency, geolocates every hop IP using ip-api.com, and renders the full path as animated lines on a world map SVG. Latency is color-coded:

- 🟢 Green — under 50ms (low)
- 🟡 Amber — 50–150ms (medium)
- 🔴 Red — over 150ms (high congestion)

### Security Scan

Three-layer analysis:
1. **Pattern matching** — regex checks for phishing keywords, typosquatting (payp4l, g00gle), homograph characters (rn→m, 0→o)
2. **Spoofing detection** — queries the domain 3 times, flags inconsistent responses
3. **Email security** — checks for SPF, DMARC, CAA records

All findings combine into a 0–100 risk score with levels: `clean → low-risk → suspicious → malicious`

---

## Architecture & System Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                           │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │index.html│  │ main.js  │  │feature JS│  │  feature CSS │   │
│  │(tab shell)│  │(tab router│  │(13 files)│  │  (13 files)  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────────┘   │
│       └─────────────┴─────────────┘                            │
│                         │ Lazy Load on tab click               │
│                         │ fetch() REST calls                   │
└─────────────────────────┼───────────────────────────────────────┘
                          │ HTTP/REST (localhost:3000)
┌─────────────────────────┼───────────────────────────────────────┐
│                   SERVER LAYER (server.js)                      │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Express.js Router                      │  │
│  │  /api/resolve  /api/cache  /api/compare  /api/bulk  ...   │  │
│  └──────┬──────────┬──────────┬──────────┬──────────────────┘  │
│         │          │          │          │                      │
│  ┌──────▼───┐ ┌────▼────┐ ┌──▼───────┐ ┌▼─────────────────┐   │
│  │  DNS     │ │  Cache  │ │   Port   │ │   Security &     │   │
│  │ Resolver │ │ Manager │ │ Scanner  │ │  Threat Engine   │   │
│  │(iterative│ │(in-mem  │ │(net.Sock)│ │(pattern matcher) │   │
│  │  /recur) │ │ + TTL)  │ │          │ │                  │   │
│  └──────────┘ └─────────┘ └──────────┘ └──────────────────┘   │
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌───────────────────────┐   │
│  │  Traceroute  │ │  Geo Engine  │ │   History Manager     │   │
│  │(child_process│ │(ip-api.com)  │ │  (fs → JSON file)     │   │
│  │ traceroute/t)│ │              │ │                       │   │
│  └──────────────┘ └──────────────┘ └───────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────┐
│                   EXTERNAL SERVICES                             │
│                                                                 │
│   ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│   │  DNS Servers │  │  ip-api.com  │  │  OS traceroute/rt    │  │
│   │(Root/TLD/Auth│  │ (geolocation)│  │  (system command)    │  │
│   │  nameservers)│  │              │  │                      │  │
│   └─────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Interaction Diagram

```
User Input (domain)
        │
        ▼
  ┌─────────────┐     Cache HIT ──────────────────────────┐
  │ /api/resolve│──────────────────────────────────────   │
  └──────┬──────┘     Cache MISS                          │
         │                                                │
         ▼                                                ▼
  ┌─────────────────────────────────────┐     ┌──────────────────┐
  │      Iterative Resolution Engine    │     │   Cache Manager  │
  │                                     │     │                  │
  │  Step 1: Root NS (198.41.0.4)       │────▶│  key: domain+type│
  │  Step 2: TLD NS  (192.5.6.30)       │     │  value: records  │
  │  Step 3: Authoritative NS (real)    │     │  ttl: from DNS   │
  └─────────────────────────────────────┘     │  expiresAt: Date │
         │                                    └──────────────────┘
         ▼
  ┌─────────────────────────────────────┐
  │           Node dns module           │
  │   dns.resolve(), dns.resolveNs()    │
  └─────────────────────────────────────┘
         │
         ▼
  Final Answer + Steps JSON → Browser → Animated hop tree UI
```

### Data Flow: Traceroute + Geo Map

```
Browser ──▶ /api/traceroute?domain=x
                    │
                    ▼
          child_process.exec(traceroute / tracert)
                    │
                    ▼
          Parse each hop: IP + latency (ms)
                    │
                    ▼ (parallel Promise.all)
          ip-api.com → { lat, lon, city, country }
                    │
                    ▼
          JSON: [ { hop, ip, ms, lat, lon, city } ]
                    │
                    ▼
          geomap.js → latLonToXY() → SVG world map
          Animated polyline: green(<50ms) / amber / red(>150ms)
```

### Caching Layer Design

```
┌──────────────────────────────────────────────┐
│              In-Memory Cache                 │
│                                              │
│  {                                           │
│    "google.com:A": {                         │
│       records: [...],                        │
│       ttl: 300,          ◀── from DNS reply  │
│       expiresAt: Date    ◀── Date.now()+ttl  │
│    }                                         │
│  }                                           │
│                                              │
│  On every lookup:                            │
│  if (Date.now() > expiresAt) → evict + miss  │
│  else → return cached records                │
└──────────────────────────────────────────────┘
         │                        │
         ▼                        ▼
  /api/cache (GET)         Cache Viewer UI
  /api/cache (DELETE)      live TTL countdown bars
```

### Security Scan Pipeline

```
Domain Input
     │
     ├──▶ Layer 1: Pattern Matching
     │         regex: phishing keywords
     │         typosquatting (payp4l, g00gle)
     │         homograph chars (rn→m, 0→o)
     │
     ├──▶ Layer 2: DNS Consistency (Spoofing Check)
     │         resolve domain × 3
     │         compare IP sets → flag if inconsistent
     │
     └──▶ Layer 3: Email Security Records
               SPF  (TXT record: v=spf1...)
               DMARC (TXT record: _dmarc.domain)
               CAA   (Certification Authority Auth)
                            │
                            ▼
                   Risk Score 0–100
                   clean / low-risk / suspicious / malicious
```

### Frontend Lazy Loading Strategy

```
index.html loads once (shell + tab bar)
         │
         ▼
User clicks Tab N
         │
         ▼
main.js checks: feature[N].loaded?
         │
    NO ──┤──▶ fetch /features/tabN.html → inject into container
         │    fetch /js/tabN.js         → execute
         │    fetch /css/features/tabN.css → inject <style>
         │    mark feature[N].loaded = true
         │
   YES ──┴──▶ show cached DOM directly
```

### Module Responsibilities

| Module | Responsibility | Key APIs / Techniques |
|--------|---------------|----------------------|
| `server.js` | All backend logic, routing, DNS resolution, caching | Express, `dns`, `net`, `child_process`, `fs` |
| `main.js` | Tab switching, lazy feature loader | `fetch()`, DOM injection |
| `resolve.js` | Animated step-by-step DNS hop tree | SVG tree rendering, XHR |
| `cache.js` | Live cache viewer with TTL progress bars | `setInterval`, CSS transitions |
| `geomap.js` | World map + traceroute path | Equirectangular projection, inline SVG |
| `security.js` | Threat score gauge + findings list | Canvas arc gauge, regex engine |
| `perf.js` | Latency bar chart across 4 DNS providers | Pure SVG bars |
| `dnshistory.js` | Snapshot timeline, change diff | Persistent JSON polling |

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resolve?domain=&type=` | Iterative DNS resolution with steps |
| GET | `/api/cache` | View all cached entries |
| DELETE | `/api/cache` | Clear the cache |
| GET | `/api/compare?domain=` | Iterative vs recursive side-by-side |
| POST | `/api/bulk` | Bulk resolve — body: `{ domains: [], type: "A" }` |
| GET | `/api/propagation?domain=` | Check propagation across 6 resolvers |
| GET | `/api/whois?domain=` | Domain info from DNS records |
| GET | `/api/portscan?domain=` | TCP port scan (15 ports) |
| GET | `/api/health?domain=` | 9-point DNS health audit with score |
| GET | `/api/perf?domain=` | Latency benchmark across 4 DNS providers |
| GET | `/api/security?domain=` | Threat detection + risk scoring |
| GET | `/api/geomap?domain=` | IP geolocation of all DNS records |
| GET | `/api/traceroute?domain=` | Network path with hop geolocation |
| GET | `/api/history/record?domain=&type=` | Save DNS snapshot to disk |
| GET | `/api/history/query?domain=` | Load saved history + detect changes |
| DELETE | `/api/history` | Clear all saved history |

### Example Response — `/api/resolve`

```json
{
  "domain": "google.com",
  "queryType": "A",
  "fromCache": false,
  "totalMs": 87,
  "ttl": 300,
  "answer": [
    { "value": "142.250.67.142", "ttl": 300 }
  ],
  "steps": [
    { "step": 1, "type": "root", "server": "Root Nameserver", "serverIP": "198.41.0.4", "ms": 23 },
    { "step": 2, "type": "tld",  "server": "TLD Nameserver (.com)", "serverIP": "192.5.6.30", "ms": 41 },
    { "step": 3, "type": "authoritative", "server": "ns1.google.com", "ms": 18 }
  ]
}
```

---

## CN Concepts Implemented

| Concept | Where implemented |
|---------|-------------------|
| Iterative DNS Resolution | `resolveWithSteps()` in server.js |
| Recursive DNS Resolution | `/api/compare` — single resolver call |
| DNS Record Types (A, AAAA, MX, NS, CNAME, TXT, SOA, CAA) | `/api/resolve`, `/api/health`, `/api/whois` |
| TTL-based Caching | `getFromCache()` / `setCache()` in server.js |
| TCP Socket Programming | `checkPort()` using `net.Socket` |
| Network Path / Traceroute | `/api/traceroute` using OS traceroute command |
| DNS Propagation Delay | `/api/propagation` — multi-resolver consistency check |
| Email Security (SPF, DMARC) | `/api/health`, `/api/whois`, `/api/security` |
| DNS Spoofing / Cache Poisoning | `detectSpoofing()` in `/api/security` |
| IP Geolocation | `geolocateIP()` calling ip-api.com |
| Concurrent Requests | `Promise.all()` in bulk resolver and port scanner |
| Persistent Storage | `dns_history.json` written via `fs` module |
| Equirectangular Map Projection | `latLonToXY()` in geomap.js |

---

## Screenshots

> Add screenshots of each tab here after taking them from the running app.  
> Suggested screenshots:
> - Resolve tab showing animated hop tree
> - Compare tab showing iterative vs recursive
> - Map tab showing world map with traceroute path
> - Security tab showing risk score ring
> - Health tab showing audit checklist

---

## Team

| Member | Parts Covered |
|--------|--------------|
| 1  | DNS Concepts, Server Setup, index.html, main.js |
| 2 | Resolution Engine, Cache, TTL |
| 3 | Compare, History, Bulk Resolver |
| 4| Propagation, WHOIS, Port Scanner |
| 5 | Health Audit, Security & Threat Detection |
| 6 | Performance, GeoMap, Traceroute, DNS Trends |

---

## Notes

- The traceroute feature takes 20–40 seconds — this is normal as it waits for ICMP responses from each router hop.
- Propagation check and performance benchmarks use the system resolver with simulated per-provider offsets, since direct per-resolver queries require raw socket access not available in Node.js without root privileges.
- DNS history is stored in `dns_history.json` in the project root and persists across server restarts. Capped at 2000 records.
- The world map SVG is built from scratch using equirectangular projection math — no external map library is used.
