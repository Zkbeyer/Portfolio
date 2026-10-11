# Homelab status endpoint (for the Night Shift Pi LED)

The portfolio polls a tiny JSON endpoint to colour the Raspberry Pi's LED in the hero and the
"live status" sticky note in track 03. The site never depends on it: any failure shows **amber /
"status: unknown"** and the page renders normally.

Client: `Portfolio/src/night/status/homelabStatus.ts`.

## URL
`VITE_STATUS_URL` at build time, default `https://status.ailuruslab.dev/status.json`.
(Set it in `Portfolio/.env.local` or the CI build env to point somewhere else.)

## Response
`GET` → `200 application/json`

```json
{
  "healthy": true,
  "uptimeSeconds": 1234567,
  "lastSelfHeal": "2026-10-09T03:12:44Z"
}
```

| field | type | meaning |
|---|---|---|
| `healthy` | boolean, **required** | `true` → green LED, `false` → red blinking LED |
| `uptimeSeconds` | number ≥ 0 or `null` | cluster/node uptime, shown on the sticky note |
| `lastSelfHeal` | ISO-8601 string or `null` | when the Go recovery service last restarted something |

Anything else (non-200, invalid JSON, `healthy` missing or not a boolean, timeout after 5s) → unknown.
Extra fields are ignored, so it's safe to add more later.

## Behaviour of the client
- Polls on load and every 60s, only while the tab is visible (re-checks as soon as it becomes visible again).
- 5s timeout per request, `cache: "no-store"`.

## What the server needs to do
1. Serve the JSON from the existing Go service (it already knows health + recovery events), e.g.

   ```go
   http.HandleFunc("/status.json", func(w http.ResponseWriter, r *http.Request) {
       w.Header().Set("Content-Type", "application/json")
       w.Header().Set("Cache-Control", "no-store")
       w.Header().Set("Access-Control-Allow-Origin", allowedOrigin) // the portfolio's origin
       json.NewEncoder(w).Encode(map[string]any{
           "healthy":       health.OK(),
           "uptimeSeconds": int(time.Since(bootTime).Seconds()),
           "lastSelfHeal":  lastHeal, // *time.Time → null when never
       })
   })
   ```
2. **CORS**: allow the origin the portfolio is served from (the Vite `base` is `/Portfolio/`, so most
   likely a GitHub Pages origin — confirm before deploying). `GET` only, no credentials.
3. Expose only those three fields — nothing about hosts, IPs or internal service names.
4. Route it publicly (Cloudflare tunnel / ingress with automatic TLS) at the URL above.
