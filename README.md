# DNS Resolver

> A full-featured DNS analysis and network diagnostic tool built with Node.js and Express.  
> Designed as a Computer Networks project, it provides an interactive web interface to explore how DNS resolution works — step by step — alongside a rich suite of advanced domain intelligence tools.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)

---

## Overview

DNS Resolver v2 is a web-based application that simulates and visualizes the DNS resolution process. It walks users through each step of an iterative DNS lookup — from querying root nameservers to TLD servers to authoritative nameservers — and presents the results in a clean, human-readable interface.

Beyond basic resolution, the tool offers a comprehensive set of network utilities including WHOIS lookup, DNS propagation checking, port scanning, security analysis, performance benchmarking, geographic IP mapping, and a full DNS history recorder.

---

## Features

| Feature                               | Description                                                                             |
| ------------------------------------- | --------------------------------------------------------------------------------------- |
| **DNS Resolver**                      | Step-by-step iterative DNS resolution with Root → TLD → Authoritative server simulation |
| **DNS Cache Viewer**                  | Inspect and clear the in-memory DNS cache with TTL countdown                            |
| **Iterative vs Recursive Comparison** | Side-by-side comparison of both DNS resolution modes                                    |
| **Bulk Resolver**                     | Resolve up to 20 domains simultaneously with a chosen record type                       |
| **DNS Propagation Checker**           | Verify DNS propagation across multiple global resolvers                                 |
| **WHOIS / Domain Info**               | Retrieve nameservers, IPv4/IPv6 records, MX, TXT, and SOA records                       |
| **Port Scanner**                      | Scan common ports on a target host and report open/closed status                        |
| **Health Check**                      | Check HTTP/HTTPS reachability and response details of a domain                          |
| **Performance Benchmark**             | Measure and compare DNS resolution times across multiple runs                           |
| **Security Analyzer**                 | Check SPF, DMARC, DNSSEC, and other security-related DNS records                        |
| **Geo Map**                           | Visualize the geographic location of resolved IP addresses                              |
| **DNS History**                       | Record and query DNS lookup history stored in a persistent JSON file                    |
| **Query History**                     | In-session browser history of past DNS queries                                          |

---

## Project Structure

```
dns-resolver-v2-fixed/
└── project/
    ├── server.js               # Main Express server — all API logic lives here (~1048 lines)
    ├── package.json            # Project metadata and dependencies
    ├── dns_history.json        # Persistent DNS history log (auto-created)
    └── public/
        ├── index.html          # Main dashboard / landing page
        ├── css/
        │   ├── base.css        # Global styles and layout
        │   ├── components.css  # Shared UI components
        │   └── features/       # Per-feature stylesheets
        │       ├── resolve.css
        │       ├── bulk.css
        │       ├── cache.css
        │       ├── compare.css
        │       ├── dnshistory.css
        │       ├── geomap.css
        │       ├── health.css
        │       ├── history.css
        │       ├── perf.css
        │       ├── portscan.css
        │       ├── propagation.css
        │       ├── security.css
        │       └── whois.css
        ├── features/           # Individual feature HTML pages
        │   ├── resolve.html
        │   ├── bulk.html
        │   ├── cache.html
        │   ├── compare.html
        │   ├── dnshistory.html
        │   ├── geomap.html
        │   ├── health.html
        │   ├── history.html
        │   ├── perf.html
        │   ├── portscan.html
        │   ├── propagation.html
        │   ├── security.html
        │   └── whois.html
        └── js/                 # Client-side JavaScript for each feature
            ├── main.js
            ├── resolve.js
            ├── bulk.js
            ├── cache.js
            ├── compare.js
            ├── dnshistory.js
            ├── geomap.js
            ├── health.js
            ├── history.js
            ├── perf.js
            ├── portscan.js
            ├── propagation.js
            ├── security.js
            └── whois.js
```

---

## Prerequisites

- **Node.js** v16 or higher
- **npm** v7 or higher

---

## Installation

**1. Clone or extract the project**

```bash
# If you have the zip file:
unzip dns-resolver-v2-fixed.zip
cd dns-resolver-v2-fixed/project
```

**2. Install dependencies**

```bash
npm install
```

This installs Express 5 and all required packages. The `node_modules/` directory is already included in the archive, so this step is optional if you prefer to use the bundled dependencies.

---

## Running the Application

```bash
npm start
```

or equivalently:

```bash
node server.js
```

The server starts on **port 3000**. Open your browser and navigate to:

```
http://localhost:3000
```

You will be greeted by the main dashboard, from which all features are accessible.

---

## API Reference

All endpoints are served under `/api`. Responses are JSON.

---

### `GET /api/resolve`

Performs a step-by-step iterative DNS resolution for a domain.

| Parameter | Type   | Required | Description                                                                            |
| --------- | ------ | -------- | -------------------------------------------------------------------------------------- |
| `domain`  | string | Yes      | The domain name to resolve (e.g., `google.com`)                                        |
| `type`    | string | No       | DNS record type. Default: `A`. Options: `A`, `AAAA`, `MX`, `TXT`, `NS`, `CNAME`, `SOA` |

**Example:**

```
GET /api/resolve?domain=example.com&type=A
```

**Response fields:**

- `domain` — cleaned domain string
- `queryType` — record type queried
- `fromCache` — whether the result was served from cache
- `steps` — array of resolution steps (root → TLD → authoritative)
- `answer` — final resolved records
- `totalMs` — total resolution time in milliseconds

---

### `GET /api/cache`

Returns all current in-memory DNS cache entries with their remaining TTL.

**No parameters required.**

---

### `DELETE /api/cache`

Clears the entire in-memory DNS cache.

**No parameters required.**

---

### `GET /api/compare`

Compares iterative DNS resolution (simulated multi-step) against recursive resolution (via system resolver) for a given domain.

| Parameter | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| `domain`  | string | Yes      | Domain to compare |

---

### `POST /api/bulk`

Resolves multiple domains in parallel.

**Request body (JSON):**

| Field     | Type     | Required | Description                    |
| --------- | -------- | -------- | ------------------------------ |
| `domains` | string[] | Yes      | Array of domain names (max 20) |
| `type`    | string   | No       | DNS record type. Default: `A`  |

**Example:**

```json
{
  "domains": ["google.com", "github.com", "openai.com"],
  "type": "A"
}
```

---

### `GET /api/propagation`

Checks DNS propagation for a domain across multiple global resolvers.

| Parameter | Type   | Required | Description                     |
| --------- | ------ | -------- | ------------------------------- |
| `domain`  | string | Yes      | Domain to check propagation for |

**Response includes:** per-resolver status, answer IPs, latency, and an overall `propagated` boolean.

---

### `GET /api/whois`

Returns comprehensive domain information including nameservers, IPv4/IPv6 addresses, MX records, TXT records, and SOA data.

| Parameter | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| `domain`  | string | Yes      | Domain to look up |

---

### `GET /api/portscan`

Scans a set of common ports on the specified host.

| Parameter | Type   | Required | Description                   |
| --------- | ------ | -------- | ----------------------------- |
| `domain`  | string | Yes      | Target hostname or IP to scan |

---

### `GET /api/health`

Checks the HTTP and HTTPS reachability of a domain, returning status codes and response metadata.

| Parameter | Type   | Required | Description            |
| --------- | ------ | -------- | ---------------------- |
| `domain`  | string | Yes      | Domain to health-check |

---

### `GET /api/perf`

Runs multiple DNS resolution attempts and returns timing statistics (min, max, average latency).

| Parameter | Type   | Required | Description         |
| --------- | ------ | -------- | ------------------- |
| `domain`  | string | Yes      | Domain to benchmark |

---

### `GET /api/security`

Analyzes security-related DNS records including SPF, DMARC, DNSSEC indicators, and TXT record content.

| Parameter | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| `domain`  | string | Yes      | Domain to analyze |

---

### `GET /api/geomap`

Resolves a domain and returns geographic location data for its IP addresses.

| Parameter | Type   | Required | Description         |
| --------- | ------ | -------- | ------------------- |
| `domain`  | string | Yes      | Domain to geolocate |

---

### `GET /api/history/record`

Records a DNS query result to the persistent `dns_history.json` file.

| Parameter | Type   | Required | Description               |
| --------- | ------ | -------- | ------------------------- |
| `domain`  | string | Yes      | Domain that was resolved  |
| `type`    | string | No       | Record type. Default: `A` |

---

### `GET /api/history/query`

Retrieves previously recorded DNS history from the persistent JSON store.

| Parameter | Type   | Required | Description              |
| --------- | ------ | -------- | ------------------------ |
| `domain`  | string | No       | Filter history by domain |

---

## How It Works

### DNS Cache

The server maintains an **in-memory DNS cache** keyed by `domain|type`. Each entry stores the resolved data, the original TTL, and an expiry timestamp. On every resolve request, the cache is checked first. Expired entries are evicted lazily on access.

### Iterative Resolution Simulation

The `resolveWithSteps()` function simulates the full iterative DNS resolution process:

1. **Cache check** — returns immediately if a valid cached entry exists.
2. **Root server query** — contacts one of three hardcoded IANA root server IPs and adds a simulated network delay.
3. **TLD server query** — looks up the appropriate TLD nameserver (`.com`, `.net`, `.org`, `.in`, `.io` supported) with simulated latency.
4. **Authoritative server query** — performs the actual DNS resolution using Node's built-in `dns.promises` module and records the result along with TTL.

Each step is returned as a structured object, allowing the frontend to display the full resolution trace.

### Persistent History

DNS lookup history is stored in `dns_history.json` in the project root. This file is read and written on each history record/query request, allowing history to persist across server restarts.

---

## Technology Stack

| Layer              | Technology                                        |
| ------------------ | ------------------------------------------------- |
| **Runtime**        | Node.js                                           |
| **Web Framework**  | Express 5                                         |
| **DNS Resolution** | Node.js built-in `dns` module (`dns.promises`)    |
| **Networking**     | Node.js built-in `net` module (TCP port scanning) |
| **Frontend**       | Vanilla HTML, CSS, JavaScript                     |
| **Data Storage**   | In-memory object (cache) + JSON file (history)    |

---

## Notes

- The **iterative resolution steps** (root and TLD server queries) are **simulated** with realistic latency using `setTimeout`. The final authoritative lookup is performed using the real system DNS resolver.
- Port scanning uses raw TCP connections with a **3-second timeout** per port. Results indicate whether a port is `open` or `closed/filtered`.
- DNS history is stored in plain JSON and is not encrypted. Do not record sensitive domains in shared environments.
- The server is designed for **local/educational use**. It is not hardened for production deployment.
- Fatima
