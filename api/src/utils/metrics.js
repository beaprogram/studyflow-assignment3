// Prometheus instrumentation for the StudyFlow API.
//
// Exposes on GET /metrics:
//   - process CPU and memory (prom-client default collectors)
//   - HTTP request duration histogram (latency)
//   - HTTP request counter labelled by status code (error rate)
//   - in-flight request gauge (saturation)

const client = require('prom-client');

const register = new client.Registry();
register.setDefaultLabels({ app: 'studyflow-api' });
client.collectDefaultMetrics({ register });

// Request latency. Buckets are chosen around the values actually observed in
// load testing (cache hits land in the low-millisecond buckets, Atlas round
// trips in the 50-100ms buckets), so the histogram has resolution exactly where
// this API's behaviour changes.
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

// Request counter. Error rate is derived in Grafana as the ratio of 4xx/5xx
// requests to all requests.
const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Concurrency gauge: how many requests are in flight right now.
const httpRequestsInFlight = new client.Gauge({
  name: 'http_requests_in_flight',
  help: 'Number of HTTP requests currently being processed',
  registers: [register],
});

/**
 * Express middleware that records timing and outcome for every request.
 *
 * The route label uses Express's matched route pattern (e.g.
 * "/api/v1/courses/:id") rather than the raw URL. This matters: labelling by
 * raw URL would create a new time series per course id, which is the classic
 * Prometheus cardinality explosion.
 */
function metricsMiddleware(req, res, next) {
  const end = httpRequestDuration.startTimer();
  httpRequestsInFlight.inc();

  res.on('finish', () => {
    // req.route is only populated once Express matches a handler; fall back to
    // the path for 404s.
    const route = req.route ? req.baseUrl + req.route.path : (req.path || 'unknown');
    const labels = { method: req.method, route, status_code: res.statusCode };
    end(labels);
    httpRequestTotal.inc(labels);
    httpRequestsInFlight.dec();
  });

  next();
}

/** Express handler for GET /metrics, in Prometheus text exposition format. */
async function metricsHandler(_req, res) {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}

module.exports = { register, metricsMiddleware, metricsHandler };
