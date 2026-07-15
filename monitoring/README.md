# Monitoring - Prometheus + Grafana

Continuous monitoring of the StudyFlow API: CPU, memory, request latency, and
error rate.

## Files

- `prometheus.yml` - scrapes the API's `/metrics` endpoint every five seconds.
- `docker-compose.yml` - runs Prometheus and Grafana locally.
- `grafana-datasource.yml` - provisions Prometheus as the Grafana data source.
- `grafana-dashboard-provider.yml` - provisions dashboards from JSON files.
- `grafana-dashboard.json` - six-panel StudyFlow dashboard.
- `screenshots/grafana-dashboard.png` - verified dashboard evidence used in the report.

## Run and verify

1. Start the optimized API on port 5050: `cd api && npm start`.
2. Start monitoring: `cd monitoring && docker compose up -d`.
3. Check Prometheus targets at `http://localhost:9090/targets`; both targets
   should be `UP`.
4. Open Grafana at `http://localhost:3000` (`admin` / `admin`) and open the
   automatically provisioned `StudyFlow API - Performance & Health` dashboard.

The API publishes Node process CPU and memory metrics, an HTTP latency
histogram, request totals by status code, and an in-flight request gauge. The
dashboard presents CPU, memory, p50/p95/p99 latency, error rate, throughput by
route, and concurrent requests.
