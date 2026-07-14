# Monitoring — Prometheus + Grafana

Continuous monitoring of the StudyFlow API: CPU, memory, request latency, and
error rate.

## Files (added as we go)

- `prometheus.yml` — scrape configuration pointing at the API's `/metrics`.
- `docker-compose.yml` — runs Prometheus and Grafana locally.
- `grafana-dashboard.json` — the exported dashboard.
- `screenshots/` — dashboard and panel images for the report.

## Approach

1. Instrument the API with `prom-client`, exposing a `/metrics` endpoint that
   publishes default process metrics (CPU, memory) plus a request-duration
   histogram and an error counter.
2. Configure Prometheus to scrape that endpoint.
3. Add Grafana with Prometheus as its data source and build a dashboard with
   time-series panels for CPU, memory, request latency, and error rate.
4. Capture screenshots for the report.
