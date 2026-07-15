# JMeter Load Tests

`StudyFlow-local.jmx` is the reproducible test plan used for the submitted
results. It logs in once, extracts a bearer token, and then exercises the
authenticated course-list endpoint plus the production client HTML, JavaScript,
and CSS bundles. A 500 ms Constant Timer provides think time between requests.

## Two scenarios

The same parameterized load group is executed twice so both scenarios use an
identical sampler tree:

- Light: 10 users, 30-second ramp-up, 10 loops per user.
- Moderate: 50 users, 60-second ramp-up, 10 loops per user.

Each CSV contains timestamp, elapsed time, response code, success flag, bytes,
latency, connect time, URL, and thread counts. The four submitted runs contain
4,808 samples in total and have a 0.00% error rate.

## Commands

Run from this directory while the API is on port 5050 and the optimized client
preview is on port 4173:

```bash
# Light
jmeter -n -t StudyFlow-local.jmx \
  -Jthreads=10 -Jramp=30 -Jloops=10 \
  -l optimized-light.csv

# Moderate
jmeter -n -t StudyFlow-local.jmx \
  -Jthreads=50 -Jramp=60 -Jloops=10 \
  -l optimized-moderate.csv
```

The baseline files were captured with the same plan and parameters before the
four optimizations. `compare.py` calculates averages, p95 values, throughput,
error rates, and percentage change:

```bash
python3 compare.py
```

## Results summary

| Scenario | Metric | Baseline | Optimized | Improvement |
|---|---:|---:|---:|---:|
| Light | Average latency | 22.6 ms | 13.0 ms | 42.3% |
| Light | p95 latency | 80 ms | 43 ms | 46.2% |
| Light | Throughput | 8.25 req/s | 8.32 req/s | 0.9% |
| Moderate | Average latency | 21.7 ms | 11.5 ms | 47.0% |
| Moderate | p95 latency | 78 ms | 38 ms | 51.3% |
| Moderate | Throughput | 24.92 req/s | 25.03 req/s | 0.4% |

The JavaScript entry bundle fell from 578,126 bytes to 177,350 bytes (69.3%)
after route-level code splitting. Course-list average latency fell by 48.5%
under light load and 51.3% under moderate load after caching and indexing.

## Files

- `StudyFlow-local.jmx` - local reproducible plan used for the CSVs.
- `StudyFlow.jmx` - deployment-target template; update host and bundle values
  before using it against a deployment.
- `baseline-light.csv`, `baseline-moderate.csv` - before measurements.
- `optimized-light.csv`, `optimized-moderate.csv` - after measurements.
- `report-*` - generated JMeter HTML dashboards for all four runs.
- `compare.py` - before/after aggregation and percentage calculations.
