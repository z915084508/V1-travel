# Public domain and HTTPS

The public domain is `v1travel.es`; `www.v1travel.es` redirects to it.
In IONOS, set the apex (`@`) and `www` A records to `89.58.16.226`.
Remove conflicting web records, including AAAA records pointing elsewhere, but
preserve email records. Both names must resolve before starting the proxy.
The VPS must accept public TCP connections on ports 80 and 443.

This separate Compose project connects Caddy only to the existing frontend
network `v1-travel_default`, forwarding requests to `web:3000`.
It does not change the application Compose file, the PostgreSQL network or data,
or the existing `127.0.0.1:3000:3000` binding.
Caddy manages and renews HTTPS certificates using persistent Docker volumes.

From `/opt/apps/V1-travel`:

```sh
docker compose -f deploy/compose.edge.yaml config -q
docker compose -f deploy/compose.edge.yaml run --rm --no-deps caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
# Only after both DNS names resolve to this VPS:
docker compose -f deploy/compose.edge.yaml up -d
```

Verify HTTPS for both names, the www redirect, the public homepage and the
unauthenticated staff redirect. Staff sign-in continues to use the existing
PostgreSQL service and production secure session cookies.

After editing the Caddyfile, validate it and reload without rebuilding the web:

```sh
docker compose -f deploy/compose.edge.yaml exec -T caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
```

To stop only public access, run `docker compose -f deploy/compose.edge.yaml stop`.
Do not remove the certificate volumes. The application and database continue
running independently.
